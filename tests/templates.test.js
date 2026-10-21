// Isolated template tests. This does not replace real-browser or iPhone testing.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {ESSENTIAL_IDS,catalogueSelection,readFavorites,escapeHtml} from '../core.js';
const data=JSON.parse(readFileSync(new URL('../data/gases.json',import.meta.url)));
function renderContext(){
  const elements=new Map();const element=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',addEventListener(){}});return elements.get(key);};
  const context=vm.createContext({ESSENTIAL_IDS,catalogueSelection,readFavorites,esc:escapeHtml,Intl,Set,Map,clearTimeout,setTimeout,matchMedia:()=>({addEventListener(){}}),document:{querySelector:element,addEventListener(){}},window:{addEventListener(){}}});
  const script=readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import.*\n/,'').replace(/start\(\);\s*$/,'');
  vm.runInContext(script,context);context.payload=data;vm.runInContext('data=payload;',context);return {context,element};
}
test('Les 64 fiches produisent les propriétés, risques, sources et notes sans valeur factice',()=>{
  const {context,element}=renderContext();
  for(const g of data.gases){context.gas=g;vm.runInContext('detail(gas)',context);const html=element('#main').innerHTML;
    assert.ok(html.includes(g.cas));assert.ok(html.includes('Risques & précautions'));assert.ok(html.includes('Applications industrielles'));assert.ok(html.includes(g.sources[0].url));assert.doesNotMatch(html,/undefined|NaN|\[object Object\]/);
    if(g.density===null)assert.ok(html.includes('Non retenue¹'));if(g.formulaNote)assert.ok(html.includes(escapeHtml(g.formulaNote)));
  }
});
test('Accueil de 12 essentiels, catalogue de 64 fiches, favoris vides et repères',()=>{
  const {context,element}=renderContext();vm.runInContext('catalogue()',context);assert.equal((element('#gas-list').innerHTML.match(/href="#gaz\//g)||[]).length,12);
  assert.ok(element('#gas-list').innerHTML.indexOf('#gaz/oxygene')<element('#gas-list').innerHTML.indexOf('#gaz/azote'));
  assert.equal(element('#other-gases').hidden,true);
  vm.runInContext("mode='all';renderList()",context);assert.equal((element('#other-gas-list').innerHTML.match(/href="#gaz\//g)||[]).length,52);assert.equal(element('#other-gases').hidden,false);
  vm.runInContext("mode='favorites';renderList()",context);assert.match(element('#empty').innerHTML,/Vos essentiels/);
  vm.runInContext('reperes()',context);assert.match(element('#main').innerHTML,/64 fiches/);
});
test('La recherche dépasse la sélection essentielle et masque les groupes non pertinents',()=>{
  const {context,element}=renderContext();vm.runInContext("mode='essentials';query='krypton';catalogue()",context);
  assert.match(element('#gas-list').innerHTML,/#gaz\/krypton/);assert.equal(element('#other-gases').hidden,true);assert.match(element('#list-caption').textContent,/64 fiches/);
});
