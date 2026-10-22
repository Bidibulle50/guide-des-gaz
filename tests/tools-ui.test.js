import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ui=await import('../tools-ui.js').catch(()=>({}));
const data=JSON.parse(readFileSync(new URL('../data/gases.json',import.meta.url)));
const entries=[...data.gases,...data.products];
test('L’accueil Outils mène au glossaire, aux conversions et aux informations existantes',()=>{
  assert.equal(typeof ui.toolsHomeMarkup,'function');
  const html=ui.toolsHomeMarkup();for(const route of ['#glossaire','#convertisseur','#guide'])assert.ok(html.includes(route));
});
test('Le glossaire cherche les accents et les termes, avec source et propriétés cumulables',()=>{
  const html=ui.glossaryListMarkup('cryogenique','all');assert.match(html,/Liquide réfrigéré/);assert.doesNotMatch(html,/Gaz dissous/);
  assert.match(ui.glossaryListMarkup('','properties'),/Comburant/);
  assert.doesNotMatch(ui.glossaryListMarkup('','states'),/Combustible \/ inflammable/);
  assert.match(ui.glossaryListMarkup('introuvable','all'),/Aucun terme/);
});
test('Le sélecteur recherche les 115 entrées et n’assimile pas Co à CO',()=>{
  assert.match(ui.converterGasListMarkup(entries,'azote'),/data-converter-entry="azote"/);
  assert.match(ui.converterGasListMarkup(entries,'arcal chrome'),/arcal-chrome/);
  assert.match(ui.converterGasListMarkup(entries,'Co'),/Aucun gaz/);
  const defaults=[...ui.converterGasListMarkup(entries).matchAll(/data-converter-entry="([^"]+)"/g)].map(([,id])=>id);
  assert.deepEqual(defaults.slice(0,3),['oxygene','azote','argon']);
  assert.equal(defaults.length,12);
});
test('Le convertisseur expose le gaz, la phase et les références avant tout calcul',()=>{
  const state={entryId:'azote',category:'gas',phase:'gaz',value:'',from:'kg',to:'m³',direction:'liquide-gaz',choosing:false};
  const html=ui.converterMarkup(entries,state);
  assert.match(html,/Azote/);assert.match(html,/15 °C/);assert.match(html,/1,013 bar absolu/);assert.match(html,/Saisissez une valeur/);assert.doesNotMatch(html,/NaN|undefined/);
});
test('Le résultat refuse un mélange sans densité et donne la source d’un calcul propre au gaz',()=>{
  const base={category:'gas',phase:'gaz',value:'1',from:'m³',to:'kg'};
  const n=ui.converterOutputMarkup(data.gases.find(g=>g.id==='azote'),base);
  assert.match(n,/1,1848/);assert.match(n,/azote/);
  const p=ui.converterOutputMarkup(data.products.find(g=>g.id==='arcal-chrome'),base);
  assert.match(p,/non documentée/);assert.doesNotMatch(p,/<output/);
});
test('Changer de phase ou choisir une donnée non couverte ne réutilise pas le résultat précédent',()=>{
  const state={category:'gas',phase:'liquide',value:'1',from:'L',to:'kg'};
  assert.match(ui.converterOutputMarkup(data.gases.find(g=>g.id==='azote'),state),/0,80611/);
  assert.doesNotMatch(ui.converterOutputMarkup(data.gases.find(g=>g.id==='argon'),state),/0,80611|<output/);
});
test('Les grandeurs signées ont une commande ± indépendante du clavier numérique mobile',()=>{
  const state={entryId:'azote',choosing:false,phase:'gaz',value:'196',from:'°C',to:'°F'};
  for(const category of ['temperature','pressure'])assert.match(ui.converterMarkup(entries,{...state,category}),/data-converter-sign/);
  assert.doesNotMatch(ui.converterMarkup(entries,{...state,category:'gas',from:'kg',to:'m³'}),/data-converter-sign/);
});
