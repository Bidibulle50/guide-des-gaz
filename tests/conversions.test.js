import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const api=await import('../conversions.js').catch(()=>({}));
const data=JSON.parse(readFileSync(new URL('../data/gases.json',import.meta.url)));
const gas=id=>data.gases.find(g=>g.id===id);
const near=(a,b)=>assert.ok(Math.abs(a-b)<=Math.max(1,Math.abs(b))*1e-10,`${a} ≠ ${b}`);
test('Le moteur de conversion est disponible',()=>assert.equal(typeof api.convertUnits,'function'));
test('Pression, débit, volume et masse gardent des facteurs indépendants du gaz',()=>{
  near(api.convertUnits('pressure','1','bar','Pa').value,100000);
  near(api.convertUnits('pressure',1,'psi','Pa').value,6894.757293168);
  near(api.convertUnits('flow','15','L/min','m³/h').value,.9);
  near(api.convertUnits('volume','1,5','m³','L').value,1500);
  near(api.convertUnits('mass',2,'t','kg').value,2000);
  near(api.convertUnits('pressure',-1,'bar','kPa').value,-100);
});
test('Températures : décalages exacts, zéro absolu et domaine valide',()=>{
  near(api.convertUnits('temperature',0,'°C','K').value,273.15);
  near(api.convertUnits('temperature',32,'°F','°C').value,0);
  near(api.convertUnits('temperature',-273.15,'°C','K').value,0);
  assert.equal(api.convertUnits('temperature',-1,'K','°C').ok,false);
});
test('Saisie française, valeurs vides, données non numériques et débordement',()=>{
  near(api.parseQuantity('1 000,5'),1000.5);
  near(api.parseQuantity('0,001'),.001);
  for(const value of ['', ' ', '1,2,3', '12abc', 'NaN','Infinity','1 2'])assert.equal(api.parseQuantity(value),null,value);
  assert.equal(api.convertUnits('volume','1e309','L','m³').ok,false);
  assert.equal(api.convertUnits('pressure',1,'kg','bar').ok,false);
});
test('Azote et oxygène utilisent leur propre masse volumique gazeuse et leur référence',()=>{
  const n=api.convertGasQuantity(gas('azote'),1,'m³','kg','gaz');
  const o=api.convertGasQuantity(gas('oxygene'),1,'m³','kg','gaz');
  near(n.value,1.1848);near(o.value,1.354);
  assert.equal(n.profile.temperatureC,15);assert.equal(n.profile.pressureBar,1.013);
  assert.match(n.conditions,/15/);assert.match(n.source.url,/azote/);
  near(api.convertGasQuantity(gas('azote'),1.1848,'kg','m³','gaz').value,1);
});
test('Les deux liquides documentés ont une conversion distincte au point d’ébullition',()=>{
  near(api.convertGasQuantity(gas('azote'),1,'L','kg','liquide').value,.80611);
  near(api.convertGasQuantity(gas('oxygene'),1,'L','kg','liquide').value,1.1412);
  assert.equal(api.convertGasQuantity(gas('argon'),1,'L','kg','liquide').ok,false);
});
test('Les équivalences gaz/liquide utilisent le facteur publié avec les deux conditions',()=>{
  const n=api.convertPhaseVolume(gas('azote'),1,'L','L','liquide-gaz');
  const o=api.convertPhaseVolume(gas('oxygene'),1,'L','L','liquide-gaz');
  near(n.value,680.38);near(o.value,843.57);
  near(api.convertPhaseVolume(gas('azote'),680.38,'L','L','gaz-liquide').value,1);
  assert.match(n.conditions,/15/);assert.match(n.conditions,/ébullition/);
  assert.equal(api.convertPhaseVolume(gas('argon'),1,'L','L','liquide-gaz').ok,false);
});
test('Aucune densité ou équivalence fabriquée pour les produits commerciaux et les données absentes',()=>{
  const product=data.products.find(g=>g.id==='arcal-chrome');
  assert.equal(api.convertGasQuantity({...product,density:1.5,densityReference:{phase:'gaz',temperatureC:15,pressureBar:1.013}},1,'m³','kg','gaz').ok,false);
  assert.equal(api.convertGasQuantity(gas('chlorure-methyle'),1,'m³','kg','gaz').ok,false);
  assert.equal(api.convertPhaseVolume(product,1,'L','L','liquide-gaz').ok,false);
  assert.equal(api.convertGasQuantity(gas('azote'),-1,'kg','m³','gaz').ok,false);
});
test('Changer de phase, une unité impossible ou une référence incomplète ne donne pas de résultat trompeur',()=>{
  assert.equal(api.convertGasQuantity(gas('azote'),1,'bar','kg','gaz').ok,false);
  assert.equal(api.convertGasQuantity(gas('azote'),1,'kg','m³','inconnue').ok,false);
  assert.equal(api.convertGasQuantity({...gas('azote'),densityReference:null},1,'kg','m³','gaz').ok,false);
});
test('Une source absente ou une équivalence sans conditions bloque le calcul physique',()=>{
  assert.equal(api.convertGasQuantity({...gas('azote'),sources:[]},1,'kg','m³','gaz').ok,false);
  const missing=structuredClone(gas('azote'));
  delete missing.consultation.physical.liquid.find(p=>p.label==='Équivalent liquide → gaz').conditions;
  assert.equal(api.convertPhaseVolume(missing,1,'L','L','liquide-gaz').ok,false);
});
