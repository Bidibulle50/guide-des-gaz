import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ESSENTIAL_IDS, orderGases, catalogueSelection, normalize, searchGases, readFavorites, escapeHtml } from '../core.js';
const data = JSON.parse(readFileSync(new URL('../data/gases.json', import.meta.url)));
const gases = data.gases;
const ids = new Set(gases.map(g=>g.id));
test('Priorité aux essentiels, reste alphabétique, sans mutation du catalogue',()=>{
  const before=gases.map(g=>g.id);const ordered=orderGases(gases);
  assert.deepEqual(ordered.slice(0,12).map(g=>g.id),ESSENTIAL_IDS);assert.equal(new Set(ESSENTIAL_IDS).size,12);
  assert.deepEqual(gases.map(g=>g.id),before);
  const rest=ordered.slice(12);for(let i=1;i<rest.length;i++)assert.ok(rest[i-1].name.localeCompare(rest[i].name,'fr',{numeric:true,sensitivity:'base'})<=0);
  assert.equal(catalogueSelection(gases,'','essentials',new Set()).length,12);
  assert.equal(catalogueSelection(gases,'','all',new Set()).length,64);
  assert.deepEqual(catalogueSelection(gases,'','favorites',new Set(['krypton'])).map(g=>g.id),['krypton']);
  for(const mode of ['essentials','all','favorites'])assert.equal(catalogueSelection(gases,'krypton',mode,new Set())[0].id,'krypton');
});
test('Recherche accents, indices Unicode, formule, CAS et abréviations liquides',()=>{
  for(const [query,id] of [['hélium','helium'],['ACETYLENE','acetylene'],['co₂','dioxyde-carbone'],['N ₂','azote'],['LOX','oxygene'],['LIN','azote'],['LAR','argon'],['7782-44-7','oxygene']]) assert.equal(searchGases(gases,query)[0]?.id,id);
  assert.equal(normalize('C₂H₂'),'c2h2');
  assert.equal(searchGases(gases,'CO')[0].id,'monoxyde-carbone');
  assert.deepEqual(searchGases(gases,'Co'),[]);
  assert.deepEqual(searchGases(gases,'gaz inconnu'),[]);
});
test('Filtre favoris, aucun favori, persistance corrompue ou identifiants inconnus',()=>{
  assert.equal(searchGases(gases,'',new Set(['argon'])).length,1);
  assert.equal(searchGases(gases,'oxygène',new Set(['argon'])).length,0);
  assert.equal(searchGases(gases,'',new Set()).length,0);
  for(const raw of ['null','{}','1','erreur']) assert.equal(readFavorites(raw,ids).size,0);
  assert.deepEqual([...readFavorites('["argon","absent",1,"argon"]',ids)],['argon']);
});
test('Catalogue complet : 64 entrées, références et conditions explicites',()=>{
  assert.equal(gases.length,64); assert.equal(ids.size,64);
  assert.equal(new Set(gases.map(g=>g.cas)).size,63); // Hydrogen and para-hydrogen share their CAS.
  for(const g of gases){
    if(g.density!==null){assert.equal(g.densityReference.temperatureC,15);assert.equal(g.densityReference.pressureBar,1.013);assert.equal(g.densityReference.phase,'gaz');assert.ok(g.density>0);}else assert.ok(g.densityNote);
    assert.ok(g.molarMass>0);assert.match(g.cas,/^\d{2,7}-\d{2}-\d$/);
    if(g.transition)assert.equal(g.transition.pressureBar,1.013);else assert.ok(g.transitionNote);
    assert.ok(g.applications.length||g.applicationsNote);assert.ok(g.risks.length&&g.precautions.length);
    assert.ok(g.sources.every(s=>s.url.startsWith('https://')&&/^2026-10-(21|22)$/.test(s.checked)));
    for(const s of g.sources)assert.ok(new URL(s.url).hostname);
  }
});
test('Isomères, isotope, mélange, données absentes et dangers corrigés',()=>{
  const by=id=>gases.find(g=>g.id===id);
  assert.deepEqual(new Set(searchGases(gases,'C4H8').map(g=>g.id)),new Set(['1-butene','cis-2-butene','trans-2-butene','isobutene']));
  assert.equal(searchGases(gases,'R-142b')[0].id,'r142b');
  assert.equal(searchGases(gases,'dimethylether')[0].id,'dimethylether');
  assert.equal(by('air').formula,'');assert.match(by('air').formulaNote,/mélange/);
  assert.deepEqual(by('deuterium').elements,['H']);assert.match(by('deuterium').formulaNote,/isotope/);
  assert.equal(by('para-hydrogene').formula,'H2');
  for(const id of ['eau','methanol','n-hexane','r142b','chlorure-methyle'])assert.equal(by(id).density,null);
  assert.equal(by('n-hexane').family.includes('Comburant'),false);assert.ok(by('n-hexane').sources.some(s=>s.id==='inrs-113-dangers'));
  assert.match(by('silane').family,/Pyrophorique/);assert.match(by('fluor').risks.join(' '),/mortel/);
  assert.equal(by('cis-2-butene').density,2.4583);assert.equal(by('neopentane').density,3.1839);
});
test('Points sensibles vérifiés dans les sources : sublimation CO2/C2H2 et gaz monoatomiques',()=>{
  const by=id=>gases.find(g=>g.id===id);
  assert.equal(by('dioxyde-carbone').transition.kind,'sublimation');
  assert.equal(by('dioxyde-carbone').transition.temperatureC,-78.45);
  assert.equal(by('acetylene').transition.kind,'sublimation');
  assert.equal(by('acetylene').transition.temperatureC,-84.05);
  assert.equal(by('oxygene').molarMass,31.999);assert.equal(by('oxygene').density,1.354);
  for(const id of ['argon','helium','neon']) assert.equal(by(id).formula,by(id).elements[0]);
  assert.equal(by('oxygene').formula,'O2');assert.deepEqual(by('oxygene').elements,['O']);
});
test('Le texte libre ne peut pas créer de balisage HTML',()=>{
  assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
});
