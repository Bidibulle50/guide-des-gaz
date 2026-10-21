// Isolated template tests. This does not replace real-browser or iPhone testing.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {iconMarkup} from '../ui-icons.js';
import {MATERIALS,PROCESSES,NEEDS,availableProcesses,weldingSelection} from '../welding.js';
import {ESSENTIAL_IDS,catalogueSelection,readFavorites,escapeHtml} from '../core.js';
const data=JSON.parse(readFileSync(new URL('../data/gases.json',import.meta.url)));
function renderContext(documentOverrides={}){
  const elements=new Map();const element=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',addEventListener(){}});return elements.get(key);};
  const handlers={};
  const context=vm.createContext({MATERIALS,PROCESSES,NEEDS,availableProcesses,weldingSelection,iconMarkup,ESSENTIAL_IDS,catalogueSelection,readFavorites,esc:escapeHtml,Intl,Set,Map,clearTimeout,setTimeout,matchMedia:()=>({addEventListener(){}}),document:{querySelector:element,addEventListener:(type,handler)=>{handlers[type]=handler;},...documentOverrides},window:{addEventListener(){}}});
  const script=readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import.*\n/gm,'').replace(/start\(\);\s*$/,'');
  vm.runInContext(script,context);context.payload=data;vm.runInContext('data=payload;',context);return {context,element,handlers};
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

function tagAttributes(tag){
  return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([,name,value])=>[name,value]));
}
function fichePanel(html,id){
  const start=html.indexOf(`id="panel-${id}"`);
  assert.ok(start>=0,`Panneau ${id} absent`);
  const contentStart=html.indexOf('>',start)+1;
  const next=html.indexOf('<div class="fiche-panel"',contentStart);
  return html.slice(contentStart,next<0?html.indexOf('<details class="fiche-sources"',contentStart):next);
}
test('Les 115 fiches relient quatre onglets et panneaux ARIA avec Essentiel seul actif',()=>{
  const {context,element}=renderContext();
  const ids=['essential','safety','transport','technical'];
  const entries=[...data.gases,...data.products];assert.equal(entries.length,115);
  for(const entry of entries){
    context.entry=entry;vm.runInContext('detail(entry)',context);const html=element('#main').innerHTML;
    assert.equal((html.match(/role="tablist"/g)||[]).length,1,entry.id);
    const tabs=[...html.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].map(([tag])=>tagAttributes(tag));
    const panels=[...html.matchAll(/<div\b[^>]*role="tabpanel"[^>]*>/g)].map(([tag])=>({attributes:tagAttributes(tag),hidden:/\shidden(?:\s|>)/.test(tag)}));
    assert.deepEqual(tabs.map(tab=>tab['data-sheet-tab']),ids,entry.id);
    assert.deepEqual(panels.map(panel=>panel.attributes['data-panel']),ids,entry.id);
    for(let i=0;i<ids.length;i++){
      assert.equal(tabs[i]['aria-controls'],panels[i].attributes.id,entry.id);
      assert.equal(panels[i].attributes['aria-labelledby'],tabs[i].id,entry.id);
      assert.equal(tabs[i]['aria-selected'],String(i===0),entry.id);
      assert.equal(tabs[i].tabindex,i===0?'0':'-1',entry.id);
      assert.equal(panels[i].hidden,i!==0,entry.id);
    }
    assert.ok(fichePanel(html,'essential').includes(escapeHtml(entry.fds.url)),`${entry.id} : FDS visible dans Essentiel`);
    assert.ok(fichePanel(html,'transport').includes(escapeHtml(entry.fds.note)),`${entry.id} : portée de la FDS conservée`);
    for(const source of entry.sources)assert.ok(html.includes(escapeHtml(source.url)),`${entry.id} : source conservée`);
    const elementIds=[...html.matchAll(/\sid="([^"]*)"/g)].map(([,id])=>id);
    assert.equal(new Set(elementIds).size,elementIds.length,`${entry.id} : identifiants uniques`);
  }
});
test('Oxygène expose ses applications détaillées et conserve états ONU et conditions physiques',()=>{
  const {context,element}=renderContext();const oxygen=data.gases.find(g=>g.id==='oxygene');
  context.entry=oxygen;vm.runInContext('detail(entry)',context);const html=element('#main').innerHTML;
  const essential=fichePanel(html,'essential'),technical=fichePanel(html,'technical');
  assert.ok(oxygen.applicationDetails.length>=3);
  for(const application of oxygen.applicationDetails){
    assert.ok(essential.includes(escapeHtml(application.title)));
    assert.ok(essential.includes(escapeHtml(application.detail)));
    assert.ok(oxygen.sources.some(source=>source.id===application.sourceId));
  }
  assert.match(essential,/UN 1072/);assert.match(essential,/Oxygène comprimé/);
  assert.match(essential,/UN 1073/);assert.match(essential,/Oxygène liquide réfrigéré/);
  assert.match(essential,/15 °C · 1,013 bar abs\./);assert.match(essential,/1,354/);
  assert.match(technical,/31,999/);assert.match(technical,/−182,96/);
  assert.match(technical,/Phase gazeuse · 15 °C · 1,013 bar absolu/);
  assert.match(technical,/À 1,013 bar absolu/);assert.ok(technical.includes(escapeHtml(oxygen.note)));
});
test('Les sections ARCAL restent dans les bons panneaux et gardent leurs références après découpage',()=>{
  const {context,element}=renderContext();
  for(const product of data.products.filter(g=>g.welding)){
    context.product=product;
    const parts=vm.runInContext('weldingDetail(product)',context);
    assert.deepEqual(Object.keys(parts).sort(),['checklist','overview','safety','technical','uses']);
    assert.ok(Object.values(parts).every(value=>typeof value==='string'&&!/undefined|\[object Object\]/.test(value)));
    vm.runInContext('detail(product)',context);const html=element('#main').innerHTML;
    const kicker=html.match(/<p class="fiche-kicker">([^<]*)<\/p>/)?.[1];
    assert.ok(kicker?.endsWith(' · '+escapeHtml(product.welding.manufacturerCode)),`${product.id} : code fabricant visible dans l’en-tête`);
    const essential=fichePanel(html,'essential'),technical=fichePanel(html,'technical'),safety=fichePanel(html,'safety');
    for(const use of product.welding.uses)assert.ok(essential.includes(escapeHtml(use.detail)),product.id);
    for(const variant of product.welding.variants)assert.ok(technical.includes(variant.reference),product.id);
    assert.ok(technical.includes(escapeHtml(product.welding.sheet.url)),product.id);
    assert.ok(technical.includes(escapeHtml(product.composition)),product.id);
    assert.ok(safety.includes(escapeHtml(product.welding.safety.flammability)),product.id);
    assert.match(essential,/data-jump="product-supply"/);assert.match(technical,/id="product-supply"/);
    assert.match(essential,/ne remplace pas une validation technique/);
  }
});
test('Le changement d’onglet, le clavier et le raccourci Formats rendent le bon panneau accessible',()=>{
  const keys=['essential','safety','transport','technical'];let focused,scrolled=false,supplyFocused=false;
  const tabs=keys.map(key=>({dataset:{sheetTab:key},attributes:{},tabIndex:-1,setAttribute(name,value){this.attributes[name]=value;},focus(){focused=key;}}));
  const panels=keys.map(key=>({dataset:{panel:key},hidden:true}));
  const tablist={querySelectorAll:()=>tabs};
  for(const tab of tabs)tab.closest=selector=>selector==='[role=tablist]'?tablist:tab;
  const supply={closest:()=>panels[3],scrollIntoView(){scrolled=true;},focus(options){assert.equal(options.preventScroll,true);supplyFocused=true;}};
  const {context,handlers}=renderContext({querySelectorAll:selector=>selector.includes('tabpanel')?panels:tabs,getElementById:id=>id==='product-supply'?supply:null});
  const assertSelection=key=>{
    assert.deepEqual(tabs.filter(tab=>tab.attributes['aria-selected']==='true').map(tab=>tab.dataset.sheetTab),[key]);
    assert.deepEqual(tabs.filter(tab=>tab.tabIndex===0).map(tab=>tab.dataset.sheetTab),[key]);
    assert.deepEqual(panels.filter(panel=>!panel.hidden).map(panel=>panel.dataset.panel),[key]);
  };
  for(const key of keys){context.key=key;vm.runInContext('selectSheetTab(key)',context);assertSelection(key);}
  vm.runInContext("selectSheetTab('inconnu')",context);assertSelection('technical');
  for(const [from,key,to] of [['technical','ArrowRight','essential'],['essential','ArrowLeft','technical'],['safety','Home','essential'],['safety','End','technical']]){
    let prevented=false;handlers.keydown({target:tabs[keys.indexOf(from)],key,preventDefault(){prevented=true;}});
    assert.equal(prevented,true);assert.equal(focused,to);assertSelection(to);
  }
  vm.runInContext("selectSheetTab('essential')",context);assertSelection('essential');
  const jump={dataset:{jump:'product-supply'},closest(){return this;},hasAttribute(){return false;},matches(){return false;}};
  handlers.click({target:jump});assertSelection('technical');assert.equal(scrolled,true);
  assert.equal(supplyFocused,true);assert.equal(supply.tabIndex,-1);
});
