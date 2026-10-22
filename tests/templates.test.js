// Isolated template tests. This does not replace real-browser or iPhone testing.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {ficheMarkup,sheetStates} from '../fiche.js';
import {iconMarkup} from '../ui-icons.js';
import {MATERIALS,PROCESSES,NEEDS,availableProcesses,weldingSelection} from '../welding.js';
import {ESSENTIAL_IDS,catalogueSelection,readFavorites,escapeHtml} from '../core.js';
const data=JSON.parse(readFileSync(new URL('../data/gases.json',import.meta.url)));
function renderContext(documentOverrides={}){
  const elements=new Map();const element=key=>{if(!elements.has(key)){
    const classes=new Set();elements.set(key,{innerHTML:'',textContent:'',hidden:false,value:'',addEventListener(){},focus(){},classList:{toggle(name,force){const active=force??!classes.has(name);active?classes.add(name):classes.delete(name);return active;},contains:name=>classes.has(name)}});
  }return elements.get(key);};
  const handlers={};
  const context=vm.createContext({MATERIALS,PROCESSES,NEEDS,availableProcesses,weldingSelection,ficheMarkup,sheetStates,iconMarkup,ESSENTIAL_IDS,catalogueSelection,readFavorites,esc:escapeHtml,Intl,Set,Map,clearTimeout,setTimeout,location:{hash:'#catalogue'},matchMedia:()=>({addEventListener(){}}),document:{documentElement:{dataset:{}},querySelector:element,querySelectorAll:()=>[],addEventListener:(type,handler)=>{const previous=handlers[type];handlers[type]=previous?event=>{previous(event);handler(event);}:handler;},...documentOverrides},window:{addEventListener(){},scrollTo(){}}});
  const script=readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import.*\n/gm,'').replace(/start\(\);\s*$/,'');
  vm.runInContext(script,context);context.payload=data;vm.runInContext('data=payload;',context);return {context,element,handlers};
}
test('Les 64 fiches produisent les propriétés, risques, sources et notes sans valeur factice',()=>{
  const {context,element}=renderContext();
  for(const g of data.gases){context.gas=g;vm.runInContext('detail(gas)',context);const html=element('#main').innerHTML;
    assert.ok(html.includes(g.cas));assert.ok(html.includes('Risques principaux'));assert.ok(html.includes('Applications industrielles'));assert.ok(html.includes(g.sources[0].url));assert.doesNotMatch(html,/undefined|NaN|\[object Object\]/);
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
  assert.match(element('#main').innerHTML,/Quel gaz cherchez-vous/);assert.match(element('#main').innerHTML,/#gamme\/arcal/);assert.match(element('#main').innerHTML,/12 essentiels/);
  assert.match(element('#main').innerHTML,/Guide indépendant/);assert.match(element('#main').innerHTML,/Catalogue complet/);
  assert.ok(element('#main').innerHTML.includes('Édition '+data.version));
  const quick=vm.runInContext('catalogueHomeMarkup()',context);assert.equal((quick.match(/href="#gaz\//g)||[]).length,4);
  vm.runInContext("query='arcal';renderList()",context);assert.equal(element('#catalogue-home').hidden,true);assert.equal(element('#catalogue-results').hidden,false);assert.equal((element('#gas-list').innerHTML.match(/href="#gaz\//g)||[]).length,21);
  vm.runInContext("query='';catalogueOverview=false;mode='essentials';renderList()",context);assert.equal(element('#catalogue-results').hidden,false);assert.equal((element('#gas-list').innerHTML.match(/href="#gaz\//g)||[]).length,12);
});

test('Les icônes de navigation ont une classe de présentation et sont exclues du nom accessible',()=>{
 const {context,element}=renderContext();
 const routes=[['catalogue','Catalogue','catalogue'],['soudage','Soudage','welding'],['gammes','Gammes','ranges'],['reperes','Repères','references']];
 const generic=Object.fromEntries(['book','layers','compass'].map(key=>[key,iconMarkup[key]]));
 for(const [active] of routes){
  context.active=active;vm.runInContext('nav(active)',context);
  const html=element('.bottom-nav').innerHTML;
  const links=[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  assert.equal(links.length,4);
  assert.equal((html.match(/aria-current="page"/g)||[]).length,1);
  assert.equal((html.match(/class="nav-art nav-art-[a-z]+" aria-hidden="true"/g)||[]).length,4);
  for(const [index,[route,label,art]] of routes.entries()){
   const attributes=tagAttributes(links[index][1]);
   assert.equal(attributes.href,'#'+route);
   assert.equal(attributes['aria-current'],route===active?'page':undefined);
   assert.ok(links[index][2].includes(`<span class="nav-art nav-art-${art}" aria-hidden="true"></span>`));
   assert.ok(links[index][2].includes(`<span>${label}</span>`));
  }
  assert.match(links[0][1],/\bdata-home\b/);
 }
 for(const [key,markup] of Object.entries(generic)){
  assert.match(markup,/<svg\b/);assert.equal(iconMarkup[key],markup);
 }
});
test('Chaque fiche ARCAL affiche ses utilisations et toutes ses références, sans modifier les autres gammes',()=>{
  const {context,element}=renderContext();
  for(const g of data.products){
    context.product=g;vm.runInContext('detail(product)',context);const html=element('#main').innerHTML;
    if(g.range==='arcal'){
      assert.match(html,/<h2>Utilisations<\/h2>/);assert.match(html,/Formats et remplissage/);
      assert.match(html,/data-jump="product-supply"/);assert.match(html,/ne remplace pas une validation technique/);
      for(const v of g.welding.variants)assert.ok(html.includes(v.reference));
      for(const u of g.welding.uses)assert.ok(html.includes(escapeHtml(u.detail)));
      assert.ok(html.includes(g.welding.sheet.url));
    } else {assert.match(html,/<h2>Utilisations<\/h2>/);assert.doesNotMatch(html,/Formats et remplissage/);}
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
    assert.ok(html.includes(escapeHtml(entry.fds.note)),`${entry.id} : portée de la FDS conservée dans Sources et limites`);
    for(const source of entry.sources)assert.ok(html.includes(escapeHtml(source.url)),`${entry.id} : source conservée`);
    const elementIds=[...html.matchAll(/\sid="([^"]*)"/g)].map(([,id])=>id);
    assert.equal(new Set(elementIds).size,elementIds.length,`${entry.id} : identifiants uniques`);
  }
});
test('Oxygène reprend les quatre vues validées et sépare les états physiques',()=>{
  const {context,element}=renderContext();const oxygen=data.gases.find(g=>g.id==='oxygene');
  context.entry=oxygen;vm.runInContext('detail(entry)',context);const html=element('#main').innerHTML;
  const essential=fichePanel(html,'essential'),technical=fichePanel(html,'technical'),safety=fichePanel(html,'safety'),transport=fichePanel(html,'transport');
  for(const application of oxygen.consultation.states[0].applications){assert.ok(essential.includes(escapeHtml(application.title)));assert.ok(essential.includes(escapeHtml(application.detail)));}
  assert.match(essential,/ghs03/);assert.match(essential,/ghs04/);assert.match(essential,/RAL 9010/);
  assert.doesNotMatch(essential,/Repères atmosphère|19,5/);
  assert.match(transport,/UN 1072/);assert.doesNotMatch(transport,/UN 1073/);assert.match(transport,/1O/);
  assert.match(safety,/H270/);assert.match(safety,/H280/);assert.doesNotMatch(safety,/H281/);
  assert.match(technical,/15 °C · 1,013 bar absolu/);assert.match(technical,/1,354/);assert.match(technical,/31,999/);
  vm.runInContext("ficheStateSelection.set('oxygene','liquide');detail(entry)",context);
  const liquid=element('#main').innerHTML;assert.match(fichePanel(liquid,'transport'),/UN 1073/);assert.match(fichePanel(liquid,'transport'),/3O/);
  assert.match(fichePanel(liquid,'safety'),/H281/);assert.doesNotMatch(fichePanel(liquid,'safety'),/H280/);
  assert.match(fichePanel(liquid,'technical'),/−182,96/);assert.match(fichePanel(liquid,'technical'),/1[\s\u202f]141,2/);
  assert.match(fichePanel(liquid,'technical'),/Au point d’ébullition/);
});
test('Les sections ARCAL restent dans les bons panneaux et gardent leurs références après découpage',()=>{
  const {context,element}=renderContext();
  for(const product of data.products.filter(g=>g.welding)){
    context.product=product;
    const parts=vm.runInContext('weldingDetail(product)',context);
    assert.deepEqual(Object.keys(parts).sort(),['checklist','overview','safety','technical','uses']);
    assert.ok(Object.values(parts).every(value=>typeof value==='string'&&!/undefined|\[object Object\]/.test(value)));
    vm.runInContext('detail(product)',context);const html=element('#main').innerHTML;
    assert.ok(html.includes('Réf. '+escapeHtml(product.welding.manufacturerCode)),`${product.id} : code fabricant visible dans l’en-tête`);
    const essential=fichePanel(html,'essential'),technical=fichePanel(html,'technical'),safety=fichePanel(html,'safety');
    for(const use of product.welding.uses)assert.ok(essential.includes(escapeHtml(use.detail)),product.id);
    for(const variant of product.welding.variants)assert.ok(technical.includes(variant.reference),product.id);
    assert.ok(technical.includes(escapeHtml(product.welding.sheet.url)),product.id);
    for(const spec of product.welding.specifications){assert.ok(technical.includes(escapeHtml(spec.component)),product.id);assert.ok(technical.includes(escapeHtml(spec.value)),product.id);}
    assert.match(safety,/Risques principaux/);
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

function catalogueIds(html){return [...html.matchAll(/href="#gaz\/([^"]+)"/g)].map(([,id])=>id);}
function catalogueButton(dataset){return {dataset,closest(selector){return selector==='button[data-risk]'&&!('risk' in dataset)?null:this;},hasAttribute(){return false;},matches(){return false;}};}
test('Les filtres distinguent inflammable et ininflammable sans déduire le danger d’un mélange',()=>{
  const {context}=renderContext();
  const flammable=vm.runInContext("data.products.filter(g=>matchesCatalogueRisk(g,'inflammable')).map(g=>g.id)",context);
  assert.deepEqual(Array.from(flammable).sort(),['arcal-r1-5','arcal-r1-5-he20']);
  const nonflammable=data.products.filter(g=>g.welding?.safety.flammability.startsWith('Ininflammable'));
  assert.equal(nonflammable.length,19);
  for(const product of nonflammable){context.product=product;assert.equal(vm.runInContext("matchesCatalogueRisk(product,'inflammable')",context),false);}
  context.product={kind:'product',family:'Inflammable',components:['hydrogene'],composition:'H₂'};
  assert.equal(vm.runInContext("matchesCatalogueRisk(product,'inflammable')",context),false);
  assert.equal(vm.runInContext("matchesCatalogueRisk(product,'undocumented')",context),true);
  const undocumented=vm.runInContext("data.products.filter(g=>matchesCatalogueRisk(g,'undocumented'))",context);
  assert.equal(undocumented.length,30);
  for(const product of undocumented){context.product=product;assert.match(vm.runInContext('catalogueRiskMarkup(product)',context),/Dangers non détaillés · voir FDS/);}
});
test('Le filtre Asphyxiant reprend une mention explicite sans l’inférer d’un gaz inerte',()=>{
  const {context}=renderContext();
  for(const id of ['azote','argon','dioxyde-carbone']){
    context.gas=data.gases.find(g=>g.id===id);
    assert.equal(vm.runInContext("matchesCatalogueRisk(gas,'asphyxiant')",context),true,id);
  }
  context.gas={family:'Gaz noble',risks:[]};
  assert.equal(vm.runInContext("matchesCatalogueRisk(gas,'asphyxiant')",context),false);
  context.gas={family:'Inerte',risks:['Peut provoquer une asphyxie.']};
  assert.equal(vm.runInContext("matchesCatalogueRisk(gas,'asphyxiant')",context),true);
});
test('Un filtre de risque actif laisse la recherche parcourir toutes les fiches et les favoris restent accessibles',()=>{
  const {context,element,handlers}=renderContext();
  vm.runInContext("catalogueOverview=false;mode='all';catalogue()",context);
  handlers.click({target:catalogueButton({risk:'inflammable'})});
  const filtered=[...catalogueIds(element('#gas-list').innerHTML),...catalogueIds(element('#other-gas-list').innerHTML)];
  assert.ok(filtered.includes('arcal-r1-5'));assert.ok(!filtered.includes('arcal-chrome'));
  assert.match(element('#catalogue-filters').innerHTML,/data-risk="inflammable" aria-pressed="true"/);
  vm.runInContext("mode='favorites';query='I2531M20E2A001';renderList()",context);
  assert.deepEqual(catalogueIds(element('#gas-list').innerHTML),['arcal-chrome']);
  assert.equal(element('#catalogue-filters').hidden,true);assert.match(element('#list-caption').textContent,/115 fiches/);
  vm.runInContext("query='krypton';renderList()",context);
  assert.deepEqual(catalogueIds(element('#gas-list').innerHTML),['krypton']);
  vm.runInContext("query='';favorites=new Set(['argon','arcal-chrome']);renderList()",context);
  handlers.click({target:catalogueButton({mode:'favorites'})});
  assert.deepEqual(catalogueIds(element('#gas-list').innerHTML),['argon','arcal-chrome']);
  assert.equal(vm.runInContext('catalogueRisk',context),'all');
  assert.match(element('#catalogue-active-scope').innerHTML,/Favoris/);
});
test('Le catalogue conserve les 12 essentiels avant 103 autres fiches réparties en lettres sans doublon',()=>{
  const {context,element}=renderContext();
  vm.runInContext("catalogueOverview=false;mode='all';catalogue()",context);
  assert.deepEqual(catalogueIds(element('#gas-list').innerHTML),ESSENTIAL_IDS);
  const otherHtml=element('#other-gas-list').innerHTML,otherIds=catalogueIds(otherHtml);
  assert.equal(otherIds.length,103);assert.equal(new Set(otherIds).size,103);
  assert.ok(otherIds.every(id=>!ESSENTIAL_IDS.includes(id)));
  const letters=[...otherHtml.matchAll(/class="catalogue-letter"><h3>([^<]+)<\/h3>/g)].map(([,letter])=>letter);
  assert.ok(letters.includes('0–9'));assert.ok(letters.includes('E'));assert.ok(!letters.includes('É'));
  assert.equal(new Set(letters).size,letters.length);
  assert.match(element('#main').innerHTML,/<h1 id="catalogue-heading"[^>]*>Catalogue<\/h1><span>115 fiches<\/span>/);
  assert.equal(element('#catalogue-list-header').hidden,false);assert.equal(element('#catalogue-home-header').hidden,true);
  assert.equal(element('#catalogue-search-hero').classList.contains('is-list'),true);
  vm.runInContext("catalogueRisk='undocumented';renderList()",context);
  assert.equal(catalogueIds(element('#gas-list').innerHTML).length,0);
  assert.equal(catalogueIds(element('#other-gas-list').innerHTML).length,30);
});
