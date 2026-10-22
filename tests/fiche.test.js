import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sheetStates, riskItems, ficheMarkup} from '../fiche.js';
const data=JSON.parse(readFileSync(new URL('../data/gases.json',import.meta.url)));
const entries=[...data.gases,...data.products];
const get=id=>entries.find(g=>g.id===id);

test('Les 115 fiches ont quatre rubriques, usages visibles et un accès FDS par rubrique',()=>{
  for(const g of entries){
    for(const state of sheetStates(g)){
      const html=ficheMarkup(g,{stateId:state.id,back:'#catalogue',backLabel:'Catalogue',favorite:'',sources:'',technicalProduct:''});
      for(const id of ['essential','safety','transport','technical'])assert.ok(html.includes(`id="panel-${id}"`),g.id);
      assert.equal((html.match(/class="document-action fiche-fds"/g)||[]).length,4,g.id);
      assert.ok(html.includes('Utilisations'),g.id);
      assert.ok(html.includes('Ogive'),g.id);
      assert.doesNotMatch(html,/undefined|NaN|\[object Object\]/,g.id);
      assert.ok(html.includes(state.fds.url.replaceAll('&','&amp;')),g.id);
    }
  }
});
test('Sélection de l’état : O2 et N2 changent ONU, danger, FDS et propriétés ensemble',()=>{
  for(const [id,unGas,unLiquid] of [['oxygene','1072','1073'],['azote','1066','1977']]){
    const g=get(id),states=sheetStates(g);assert.equal(states.length,2);
    const gas=states.find(s=>s.phase==='gaz'),liquid=states.find(s=>s.phase==='liquide');
    assert.equal(gas.transport.number,unGas);assert.equal(liquid.transport.number,unLiquid);
    assert.notEqual(gas.fds.url,liquid.fds.url);
    const h=ficheMarkup(g,{stateId:liquid.id});
    assert.ok(h.includes('H281'));assert.ok(!h.includes('H280'));
    assert.ok(!h.includes('RAL '+g.shoulder.ral));
    assert.ok(h.includes('Au point d’ébullition'));
    assert.ok(!h.includes('Masse volumique du gaz'));
    const gaseous=ficheMarkup(g,{stateId:gas.id});assert.ok(gaseous.includes('H280'));assert.ok(!gaseous.includes('H281'));
  }
});
test('Pas de classement ni de couleur du mélange repris des constituants',()=>{
  const g=get('aligal-2'),s=sheetStates(g)[0];
  assert.equal(riskItems(g,s).length,0);
  const html=ficheMarkup(g,{});assert.ok(html.includes('Non documentée'));
  assert.ok(!html.includes('ghs04'));assert.ok(!html.includes('DANGER'));
  assert.ok(!html.includes('un-plate'));assert.ok(!html.includes('Masse molaire'));
});
test('Les liquides de référence et les familles non détaillées ne deviennent pas des gaz comprimés',()=>{
  for(const id of ['eau','methanol','r11']){
    const g=get(id),s=sheetStates(g)[0];assert.equal(s.phase,'reference');
    assert.ok(!riskItems(g,s).some(r=>r.code==='04'),id);
    assert.ok(!ficheMarkup(g,{}).includes('Gaz comprimé</button>'),id);
  }
  assert.ok(!riskItems(get('azote'),sheetStates(get('azote'))[0]).some(r=>r.code==='07'));
});
test('Chrome conserve la composition précise et les catégories ADR inconnues ne sont pas remplies',()=>{
  const g=get('arcal-chrome'),s=sheetStates(g)[0],html=ficheMarkup(g,{});
  assert.equal(s.transport.number,'1956');assert.equal(s.transport.category,null);
  assert.ok(html.includes('Non confirmée'));assert.ok(html.includes('2 % ± 0,5 %'));
  assert.ok(html.includes('1A'));assert.ok(html.includes('20'));
  assert.ok(html.includes('Ne pas se fier au seul taux d’oxygène'));
});

test('Froid et asphyxie restent visibles dès Essentiel pour LOX, LIN et les ARCAL 1A',()=>{
  for(const id of ['oxygene','azote']){
    const html=ficheMarkup(get(id),{stateId:'liquide'}).split('id="panel-safety"')[0];
    assert.ok(html.includes('Froid extrême'),id);assert.ok(html.includes('cryogéniques'),id);
  }
  for(const g of data.products.filter(g=>g.welding?.safety.classificationCode==='1A')){
    const html=ficheMarkup(g,{}).split('id="panel-transport"')[0];
    assert.ok(html.includes('Risque d’asphyxie'),g.id);assert.ok(!html.includes('ghs07'),g.id);
  }
});
