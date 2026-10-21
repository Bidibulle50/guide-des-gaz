// Isolated template tests. This does not replace real-browser or iPhone testing.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {iconMarkup} from '../ui-icons.js';
import {MATERIALS,PROCESSES,NEEDS,availableProcesses,weldingSelection} from '../welding.js';
import {ESSENTIAL_IDS,catalogueSelection,readFavorites,escapeHtml} from '../core.js';
const data=JSON.parse(readFileSync(new URL('../data/gases.json',import.meta.url)));
function renderContext(){
  const elements=new Map();const element=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',addEventListener(){}});return elements.get(key);};
  const context=vm.createContext({MATERIALS,PROCESSES,NEEDS,availableProcesses,weldingSelection,iconMarkup,ESSENTIAL_IDS,catalogueSelection,readFavorites,esc:escapeHtml,Intl,Set,Map,clearTimeout,setTimeout,matchMedia:()=>({addEventListener(){}}),document:{querySelector:element,addEventListener(){}},window:{addEventListener(){}}});
  const script=readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import.*\n/gm,'').replace(/start\(\);\s*$/,'');
  vm.runInContext(script,context);context.payload=data;vm.runInContext('data=payload;',context);return {context,element};
}
test('Les 64 fiches produisent les propriétés, risques, sources et notes sans valeur factice',()=>{
  const {context,element}=renderContext();
  for(const g of data.gases){context.gas=g;vm.runInContext('detail(gas)',context);const html=element('#main').innerHTML;
    assert.ok(html.includes(g.cas));assert.ok(html.includes('Risques & précautions'));assert.ok(html.includes('Applications industrielles'));assert.ok(html.includes(g.sources[0].url));assert.doesNotMatch(html,/undefined|NaN|\[object Object\]/);
    if(g.density===null)assert.ok(html.includes('Non retenue¹'));if(g.formulaNote)assert.ok(html.includes(escapeHtml(g.formulaNote)));
  }
});
test('Accueil de 12 essentiels, catalogue de 115 fiches, favoris vides et repères',()=>{
  const {context,element}=renderContext();vm.runInContext('catalogue()',context);assert.equal((element('#gas-list').innerHTML.match(/href="#gaz\//g)||[]).length,12);
  assert.ok(element('#gas-list').innerHTML.indexOf('#gaz/oxygene')<element('#gas-list').innerHTML.indexOf('#gaz/azote'));
  assert.equal(element('#other-gases').hidden,true);
  vm.runInContext("catalogueOverview=false;mode='all';renderList()",context);assert.equal((element('#other-gas-list').innerHTML.match(/href="#gaz\//g)||[]).length,103);assert.equal(element('#other-gases').hidden,false);
  vm.runInContext("mode='favorites';renderList()",context);assert.match(element('#empty').innerHTML,/Vos essentiels/);
  vm.runInContext('reperes()',context);assert.match(element('#main').innerHTML,/64 fiches/);
});
test('La recherche dépasse la sélection essentielle et masque les groupes non pertinents',()=>{
  const {context,element}=renderContext();vm.runInContext("mode='essentials';query='krypton';catalogue()",context);
  assert.match(element('#gas-list').innerHTML,/#gaz\/krypton/);assert.equal(element('#other-gases').hidden,true);assert.match(element('#list-caption').textContent,/115 fiches/);
});
test('Les 51 produits commerciaux gardent composition, applications, FDS et constituants séparés',()=>{
  const {context,element}=renderContext();assert.equal(data.products.length,51);assert.equal(new Set([...data.gases,...data.products].map(g=>g.id)).size,115);
  for(const product of data.products){
    assert.equal(product.formula,'');assert.ok(product.composition&&product.applications.length&&/^https?:\/\//.test(product.fds.url));
    assert.ok(product.components.every(id=>data.gases.some(g=>g.id===id)));
    context.product=product;vm.runInContext('detail(product)',context);const html=element('#main').innerHTML;
    assert.ok(html.includes(escapeHtml(product.composition)));assert.ok(html.includes(product.fds.url));assert.doesNotMatch(html,/undefined|NaN/);
    assert.ok(html.includes('ne doivent pas être transposés au mélange'));assert.ok(!html.includes('Masse molaire'));
  }
});
test('Les gammes sont accessibles et une marque se recherche sans être confondue avec une molécule',()=>{
  const {context,element}=renderContext();vm.runInContext('ranges()',context);assert.equal((element('#main').innerHTML.match(/href="#gamme\//g)||[]).length,10);
  vm.runInContext("query='aligal';catalogue()",context);assert.equal((element('#gas-list').innerHTML.match(/href="#gaz\//g)||[]).length,12);
  vm.runInContext("rangeDetail(data.ranges.find(r=>r.id==='arcal'))",context);assert.equal((element('#main').innerHTML.match(/href="#gaz\//g)||[]).length,21);
});

test('L’accueil ouvre la recherche, quatre raccourcis et les gammes sans masquer les listes complètes',()=>{
  const {context,element}=renderContext();vm.runInContext('catalogue()',context);assert.equal(element('#catalogue-home').hidden,false);assert.equal(element('#catalogue-results').hidden,true);
  assert.match(element('#main').innerHTML,/Quel gaz cherchez-vous/);assert.match(element('#main').innerHTML,/#gamme\/arcal/);assert.match(element('#main').innerHTML,/Voir les 12 essentiels/);
  vm.runInContext("query='arcal';renderList()",context);assert.equal(element('#catalogue-home').hidden,true);assert.equal(element('#catalogue-results').hidden,false);assert.equal((element('#gas-list').innerHTML.match(/href="#gaz\//g)||[]).length,21);
  vm.runInContext("query='';catalogueOverview=false;mode='essentials';renderList()",context);assert.equal(element('#catalogue-results').hidden,false);assert.equal((element('#gas-list').innerHTML.match(/href="#gaz\//g)||[]).length,12);
});

test('Les icônes de navigation ont une classe de présentation et sont exclues du nom accessible',()=>{
 const {context,element}=renderContext();vm.runInContext('catalogue()',context);
 assert.match(element('.bottom-nav').innerHTML,/<svg aria-hidden="true" focusable="false" class="icon /);
 assert.ok(!element('.bottom-nav').innerHTML.includes('<svg xmlns='));
});
test('Chaque fiche ARCAL affiche ses utilisations et toutes ses références, sans modifier les autres gammes',()=>{
  const {context,element}=renderContext();
  for(const g of data.products){
    context.product=g;vm.runInContext('detail(product)',context);const html=element('#main').innerHTML;
    if(g.range==='arcal'){
      assert.match(html,/Utilisations en détail/);assert.match(html,/Formats, pression & chapeau/);
      assert.match(html,/data-jump="product-supply"/);assert.match(html,/ne remplace pas une validation technique/);
      for(const v of g.welding.variants)assert.ok(html.includes(v.reference));
      for(const u of g.welding.uses)assert.ok(html.includes(escapeHtml(u.detail)));
      assert.ok(html.includes(g.welding.sheet.url));
    } else {assert.match(html,/Applications principales/);assert.doesNotMatch(html,/Formats, pression & chapeau/);}
  }
});
test('Onglet Soudage : parcours guidé, conditions client et fiche source accessibles',()=>{
  const {context,element}=renderContext();vm.runInContext('weldingGuide()',context);
  assert.match(element('.bottom-nav').innerHTML,/href="#soudage" aria-current="page"/);assert.match(element('#main').innerHTML,/Quel matériau/);
  vm.runInContext("weldingJourney={material:'aluminium',process:null,need:null,confirmed:[]};weldingGuide()",context);assert.match(element('#main').innerHTML,/Avec quel procédé/);
  vm.runInContext("weldingJourney.process='mig';weldingGuide()",context);assert.match(element('#main').innerHTML,/besoin principal/);
  vm.runInContext("weldingJourney.need='courant';weldingGuide()",context);const html=element('#main').innerHTML;
  assert.match(html,/#gaz\/arcal-prime/);assert.match(html,/Le client confirme le mode automatique/);assert.match(html,/Source Air Liquide/);assert.doesNotMatch(html,/undefined|NaN/);
  vm.runInContext("weldingJourney={material:'unknown',process:'unknown',need:'unknown',confirmed:[]};weldingGuide()",context);assert.match(element('#main').innerHTML,/Précisons la demande/);assert.doesNotMatch(element('#main').innerHTML,/class="welding-result"/);
});
