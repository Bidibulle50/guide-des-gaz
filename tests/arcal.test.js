import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {searchGases} from '../core.js';
const data=JSON.parse(readFileSync(new URL('../data/gases.json',import.meta.url)));
const products=data.products.filter(g=>g.range==='arcal');
const by=code=>products.find(g=>g.welding.manufacturerCode===code);

test('Les 21 produits du catalogue ARCAL France ont des usages sourcés et 76 conditionnements distincts',()=>{
  assert.equal(products.length,21);
  assert.deepEqual(products.map(g=>g.welding.manufacturerCode).sort(),['I2013','I2506','I2512','I2521','I2531','I2539','I2541','I2552','I2561','I2576','I2577','I2580','I2594','I2598','I2605','I2610','I2612','I2631','I2641','I2642','I2651']);
  assert.equal(products.filter(g=>g.welding.category==='Référents').length,4);
  const references=[];
  for(const g of products){
    const w=g.welding;
    assert.ok(w.uses.length&&w.materials.length&&w.processes.length&&w.variants.length);
    for(const u of w.uses){assert.ok(u.detail.length>40);assert.equal(u.sourceUrl,g.sourceUrl);}
    assert.match(w.standard,/^EN ISO 14175-/);
    assert.match(w.sheet.date,/^\d{2}\/\d{2}\/\d{4}$/);
    assert.ok(g.sources.some(s=>s.url===w.sheet.url));
    for(const v of w.variants){
      assert.match(v.reference,/^I\d{4}[A-Z0-9]+$/);
      assert.ok(v.reference.startsWith(w.manufacturerCode)||v.reference==='I2143RG');
      assert.ok(v.head===null||['ALTOP','EXELTOP','SMARTOP'].includes(v.head));
      assert.ok(v.pressure===null||['200 bar','300 bar'].includes(v.pressure));
      references.push(v.reference);
    }
  }
  assert.equal(references.length,76);assert.equal(new Set(references).size,76);
});
test('Chrome conserve les six associations taille / chapeau / pression de la fiche V1.4',()=>{
  const w=by('I2531').welding;
  assert.equal(w.sheet.date,'04/08/2026');
  assert.deepEqual(w.variants.map(v=>[v.size,v.head,v.pressure,v.reference]),[
    ['20 L','ALTOP','200 bar','I2531M20A2A001'],['20 L','EXELTOP','200 bar','I2531M20E2A001'],
    ['50 L','ALTOP','200 bar','I2531L50A2A001'],['50 L','EXELTOP','200 bar','I2531L50E2A001'],
    ['50 L','SMARTOP','200 bar','I2531L50S2A001'],['V09 × 50 L',null,'200 bar','I2531V09R2A001']]);
});
test('31 V2.0 ne reçoit pas les anciens cadres ni un chapeau déduit du code',()=>{
  const w=by('I2580').welding;assert.equal(w.sheet.version,'2.0');assert.equal(w.sheet.date,'05/10/2026');
  assert.deepEqual(w.variants.map(v=>[v.mode,v.size,v.head]),[['Bouteille','20 L',null],['Bouteille','50 L',null]]);
  const prime=by('I2013').welding;assert.ok(prime.variants.some(v=>v.size==='33 L'&&v.head==='EXELTOP'&&v.pressure==='300 bar'));
  assert.ok(prime.variants.some(v=>v.reference==='I2013L50Z2A001'&&v.note==='Grand débit'));
});
test('Hydrogène : les références R1 ne partagent ni systématiquement ONU ni raccord ni inflammabilité',()=>{
  for(const code of ['I2552','I2521']){
    const g=by(code);assert.equal(g.transport[0].number,'1954');assert.equal(g.welding.safety.classificationCode,'1F');
    assert.match(g.welding.safety.flammability,/Extrêmement inflammable/);assert.match(g.welding.connections,/AFNOR E.*gauche/);assert.equal(g.shoulder.ral,'3000');
  }
  const r=by('I2512');assert.equal(r.transport[0].number,'1956');assert.match(r.welding.connections,/AFNOR C/);assert.match(r.composition,/2,4/);
  assert.match(by('I2577').welding.standard,/M23-ArCO-5\/4/);
  assert.match(by('I2605').welding.standard,/I3-HeAr-30/);
  assert.ok(by('I2539').welding.notes.some(n=>n.includes('± 0,65 %')));
});
test('Recherche des références de bouteilles, procédés et matériaux, sans confusion Co/CO',()=>{
  assert.equal(searchGases(data.products,'I2531M20E2A001')[0].id,by('I2531').id);
  assert.ok(searchGases(data.products,'Duplex').some(g=>g.id===by('I2641').id));
  assert.ok(searchGases(data.products,'orbital').some(g=>g.id===by('I2512').id));
  assert.deepEqual(searchGases([...data.gases,...data.products],'Co'),[]);
  assert.equal(searchGases([...data.gases,...data.products],'CO')[0].id,'monoxyde-carbone');
});
