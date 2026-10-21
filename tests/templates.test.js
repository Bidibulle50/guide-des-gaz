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
test('Accueil de 12 essentiels, catalogue de 109 fiches, favoris vides et repères',()=>{
  const {context,element}=renderContext();vm.runInContext('catalogue()',context);assert.equal((element('#gas-list').innerHTML.match(/href="#gaz\//g)||[]).length,12);
  assert.ok(element('#gas-list').innerHTML.indexOf('#gaz/oxygene')<element('#gas-list').innerHTML.indexOf('#gaz/azote'));
  assert.equal(element('#other-gases').hidden,true);
  vm.runInContext("mode='all';renderList()",context);assert.equal((element('#other-gas-list').innerHTML.match(/href="#gaz\//g)||[]).length,97);assert.equal(element('#other-gases').hidden,false);
  vm.runInContext("mode='favorites';renderList()",context);assert.match(element('#empty').innerHTML,/Vos essentiels/);
  vm.runInContext('reperes()',context);assert.match(element('#main').innerHTML,/64 fiches/);
});
test('La recherche dépasse la sélection essentielle et masque les groupes non pertinents',()=>{
  const {context,element}=renderContext();vm.runInContext("mode='essentials';query='krypton';catalogue()",context);
  assert.match(element('#gas-list').innerHTML,/#gaz\/krypton/);assert.equal(element('#other-gases').hidden,true);assert.match(element('#list-caption').textContent,/109 fiches/);
});
test('Les 45 produits commerciaux gardent composition, applications, FDS et constituants séparés',()=>{
  const {context,element}=renderContext();assert.equal(data.products.length,45);assert.equal(new Set([...data.gases,...data.products].map(g=>g.id)).size,109);
  for(const product of data.products){
    assert.equal(product.formula,'');assert.ok(product.composition&&product.applications.length&&product.fds.url.startsWith('https://'));
    assert.ok(product.components.every(id=>data.gases.some(g=>g.id===id)));
    context.product=product;vm.runInContext('detail(product)',context);const html=element('#main').innerHTML;
    assert.ok(html.includes(escapeHtml(product.composition)));assert.ok(html.includes(product.fds.url));assert.doesNotMatch(html,/undefined|NaN/);
    assert.ok(html.includes('ne doivent pas être transposés au mélange'));assert.ok(!html.includes('Masse molaire'));
  }
});
test('Les gammes sont accessibles et une marque se recherche sans être confondue avec une molécule',()=>{
  const {context,element}=renderContext();vm.runInContext('ranges()',context);assert.equal((element('#main').innerHTML.match(/href="#gamme\//g)||[]).length,10);
  vm.runInContext("query='aligal';catalogue()",context);assert.equal((element('#gas-list').innerHTML.match(/href="#gaz\//g)||[]).length,12);
  vm.runInContext("rangeDetail(data.ranges.find(r=>r.id==='arcal'))",context);assert.equal((element('#main').innerHTML.match(/href="#gaz\//g)||[]).length,15);
});
