import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ficheMarkup} from '../fiche.js';
const data=JSON.parse(readFileSync(new URL('../data/gases.json',import.meta.url)));
const by=id=>data.gases.find(g=>g.id===id);

test('Les 64 substances ont des usages concrets reliés à leurs sources propres',()=>{
  assert.equal(data.gases.length,64);
  for(const g of data.gases){
    assert.ok(g.applicationDetails?.length,g.id);
    const sourceIds=new Set(g.sources.map(s=>s.id));
    assert.equal(sourceIds.size,g.sources.length,`${g.id} : sources sans doublon`);
    for(const a of [...g.applicationDetails,...(g.consultation?.states||[]).flatMap(s=>s.applications||[])]){
      assert.ok(a.title&&a.detail,`${g.id} : utilisation explicite`);
      assert.ok(sourceIds.has(a.sourceId),`${g.id} : source ${a.sourceId} résolue`);
    }
    assert.doesNotMatch(g.applicationsNote||'',/Aucune application industrielle précise vérifiée/,g.id);
  }
});
test('Les gaz courants couvrent au moins quatre besoins sans déduire les usages d’un isotope',()=>{
  for(const id of ['azote','oxygene','argon','hydrogene','helium','acetylene','air','methane','propane','ammoniac','dioxyde-carbone'])assert.ok(by(id).applicationDetails?.length>=4,id);
  assert.match(JSON.stringify(by('ammoniac').applicationDetails),/Réfrigération|réfrigération/);
  assert.match(JSON.stringify(by('methane').applicationDetails),/Chauffage/);
  assert.equal(by('deuterium').applicationDetails?.length,3);
  assert.equal(by('neopentane').applicationDetails?.length,1);
});
test('Azote et oxygène gardent des usages cohérents avec l’état réellement sélectionné',()=>{
  for(const id of ['azote','oxygene']){
    const g=by(id),states=g.consultation.states;
    assert.equal(states.find(s=>s.id==='gaz').applications.length>=4,true,id);
    assert.equal(states.find(s=>s.id==='liquide').applications.length>=4,true,id);
  }
  const n=by('azote');
  assert.doesNotMatch(JSON.stringify(n.consultation.states.find(s=>s.id==='gaz').applications),/surgélation|cryoconservation|cryobroyage/i);
  assert.match(ficheMarkup(n,{stateId:'liquide'}),/Cryobroyage/);
  const oxygen=by('oxygene').consultation.states.find(s=>s.id==='liquide').applications;
  for(const a of oxygen.filter(a=>/Verrerie|Synthèse|Traitement des eaux/.test(a.title)))assert.match(a.detail,/Après vaporisation/);
});
test('Les usages dispersifs des anciens réfrigérants restent historiques et le R-133a distinct de l’halothane',()=>{
  for(const id of ['r11','r12','r114','r115','r13','r21'])for(const a of by(id).applicationDetails)assert.match(`${a.title} ${a.detail}`,/historique|Ancien/i,`${id} : ${a.title}`);
  assert.equal(by('r133a').applicationDetails.length,1);
  assert.match(by('r133a').applicationDetails[0].detail,/134a/);
  assert.doesNotMatch(JSON.stringify(by('r133a').applicationDetails),/halothane/i);
});
