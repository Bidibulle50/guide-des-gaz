// Isolated template tests. This does not replace real-browser or iPhone testing.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {ficheMarkup,sheetStates} from '../fiche.js';
import {iconMarkup} from '../ui-icons.js';
import {MATERIALS,PROCESSES,NEEDS,availableProcesses,weldingSelection} from '../welding.js';
import {weldingAdvice} from '../welding-advice.js';
import {toolsHomeMarkup,glossaryMarkup,glossaryListMarkup,converterMarkup,converterOutputMarkup,converterGasListMarkup,CONVERTER_DEFAULTS} from '../tools-ui.js';
import {ESSENTIAL_IDS,catalogueSelection,readFavorites,escapeHtml} from '../core.js';
const data=JSON.parse(readFileSync(new URL('../data/gases.json',import.meta.url)));
function renderContext(documentOverrides={}){
  const elements=new Map();const element=key=>{if(!elements.has(key)){
    const classes=new Set();elements.set(key,{innerHTML:'',textContent:'',hidden:false,value:'',addEventListener(){},focus(){},classList:{toggle(name,force){const active=force??!classes.has(name);active?classes.add(name):classes.delete(name);return active;},contains:name=>classes.has(name)}});
  }return elements.get(key);};
  const handlers={};
  const context=vm.createContext({MATERIALS,PROCESSES,NEEDS,availableProcesses,weldingSelection,weldingAdvice,ficheMarkup,sheetStates,iconMarkup,ESSENTIAL_IDS,catalogueSelection,readFavorites,toolsHomeMarkup,glossaryMarkup,glossaryListMarkup,converterMarkup,converterOutputMarkup,converterGasListMarkup,CONVERTER_DEFAULTS,esc:escapeHtml,Intl,Set,Map,clearTimeout,setTimeout,location:{hash:'#catalogue'},matchMedia:()=>({addEventListener(){}}),document:{documentElement:{dataset:{}},querySelector:element,querySelectorAll:()=>[],addEventListener:(type,handler)=>{const previous=handlers[type];handlers[type]=previous?event=>{previous(event);handler(event);}:handler;},...documentOverrides},window:{addEventListener(){},scrollTo(){}}});
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
  vm.runInContext('guideAbout()',context);assert.match(element('#main').innerHTML,/64 fiches/);
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
 const routes=[['catalogue','Catalogue','catalogue'],['soudage','Soudage','welding'],['gammes','Gammes','ranges'],['reperes','Outils','references']];
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
function weldingClick(render,dataset={},attributes=[]){
  const target={dataset,hasAttribute:name=>attributes.includes(name),matches:()=>false};
  render.handlers.click({target:{closest:selector=>selector.includes('[data-risk]')?null:target}});
}
function weldingState(render,journey){
  render.context.journey=journey;
  vm.runInContext('weldingJourney=journey;weldingGuide()',render.context);
}
const weldingHtml=render=>render.element('#main').innerHTML;
const answerIds=html=>[...html.matchAll(/data-answer-for="([^"]+)"/g)].map(match=>match[1]);
const candidateIds=html=>[...html.matchAll(/data-welding-product="([^"]+)"/g)].map(match=>match[1]);

test('Soudage : parcours guidé court et accès explicite au résultat, à la source et à la fiche',()=>{
  const render=renderContext();vm.runInContext('weldingGuide()',render.context);
  assert.match(render.element('.bottom-nav').innerHTML,/href="#soudage" aria-current="page"/);
  assert.match(weldingHtml(render),/Quel métal souder/);
  assert.match(weldingHtml(render),/data-welding-direct/);
  weldingClick(render,{weldingGroup:'aluminium'});
  assert.match(weldingHtml(render),/Comment soude-t-il/);
  weldingClick(render,{weldingField:'process',value:'mig'});
  assert.match(weldingHtml(render),/Qu’est-ce qui compte pour lui/);
  weldingClick(render,{weldingField:'need',value:'courant'});
  assert.match(weldingHtml(render),/3 gaz à envisager/);
  assert.deepEqual(answerIds(weldingHtml(render)),[]);
  assert.deepEqual(candidateIds(weldingHtml(render)),['arcal-prime','arcal-31','arcal-he20','arcal-he70']);
  weldingClick(render,{weldingProduct:'arcal-prime'});
  const html=weldingHtml(render);
  assert.deepEqual(answerIds(html),['arcal-prime']);
  assert.match(html,/#gaz\/arcal-prime/);assert.match(html,/Source Air Liquide/);
  assert.match(html,/À dire au client/);assert.match(html,/data-welding-results/);
  assert.doesNotMatch(html,/undefined|NaN/);
});

test('Changer la famille remet les réponses et les confirmations à zéro sans supposer la nuance inox',()=>{
  const render=renderContext();
  weldingState(render,{material:'carbone',process:'mag',need:'cadence',confirmed:['fil-plein'],declined:['automatique']});
  weldingClick(render,{weldingPanel:'sales',product:'arcal-speed'});
  weldingClick(render,{weldingGroup:'inox'});
  assert.equal(vm.runInContext('weldingJourney.material',render.context),null);
  assert.equal(vm.runInContext('weldingJourney.process',render.context),null);
  assert.equal(vm.runInContext('weldingJourney.need',render.context),null);
  assert.equal(vm.runInContext('weldingJourney.confirmed.length+weldingJourney.declined.length',render.context),0);
  assert.equal(vm.runInContext('weldingUI.selected',render.context),null);
  assert.equal(vm.runInContext('weldingUI.panel',render.context),null);
  assert.match(weldingHtml(render),/data-value="duplex"/);assert.match(weldingHtml(render),/data-value="inox"/);
  assert.deepEqual(answerIds(weldingHtml(render)),[]);
  weldingClick(render,{weldingField:'material',value:'inox'});
  weldingClick(render,{weldingField:'process',value:'tig'});
  weldingClick(render,{weldingField:'need',value:'courant'});
  assert.match(weldingHtml(render),/Nuance inox à préciser/);
  assert.deepEqual(candidateIds(weldingHtml(render)),['arcal-prime','arcal-31','arcal-he20']);
  assert.doesNotMatch(weldingHtml(render),/data-welding-product="arcal-(?:r1-2|r1-5|m11|m12-he5-n)"/);
  weldingClick(render,{weldingProduct:'arcal-prime'});
  assert.match(weldingHtml(render),/nuance inox à préciser/);
});

test('Speed : condition visible, confirmation retirable, réponse non et réexamen effectifs',()=>{
  const render=renderContext();
  weldingState(render,{material:'carbone',process:'mag',need:'cadence',confirmed:[],declined:[]});
  let html=weldingHtml(render);
  assert.deepEqual(answerIds(html),['arcal-speed']);
  assert.match(html,/Condition à confirmer/);assert.match(html,/data-welding-confirm="fil-plein"/);
  assert.match(html,/moins de fumées, projections et silicates/);
  assert.match(html,/https:\/\/fr.airliquide.com\/gaz\/arcaltm-speed\/I2561/);
  assert.ok(html.indexOf('data-welding-confirm="fil-plein"')<html.indexOf('À dire au client'));
  assert.doesNotMatch(html,/économie garantie|gain garanti|meilleur gaz/i);
  weldingClick(render,{weldingConfirm:'fil-plein'});
  html=weldingHtml(render);
  assert.deepEqual(answerIds(html),['arcal-speed']);
  assert.match(html,/Fil plein confirmé par le client/);assert.match(html,/data-welding-unconfirm="fil-plein"/);
  assert.doesNotMatch(html,/data-welding-confirm="fil-plein"/);
  weldingClick(render,{weldingUnconfirm:'fil-plein'});
  assert.match(weldingHtml(render),/data-welding-confirm="fil-plein"/);
  assert.equal(vm.runInContext('weldingJourney.confirmed.length',render.context),0);
  weldingClick(render,{weldingDecline:'fil-plein'});
  html=weldingHtml(render);
  assert.deepEqual(answerIds(html),[]);assert.ok(!candidateIds(html).includes('arcal-speed'));
  assert.match(html,/condition a été déclarée non remplie/);assert.match(html,/data-welding-review-conditions/);
  weldingClick(render,{},['data-welding-review-conditions']);
  assert.deepEqual(answerIds(weldingHtml(render)),['arcal-speed']);
  assert.match(weldingHtml(render),/data-welding-confirm="fil-plein"/);
});

test('Une condition inconnue ouvre l’appui technique sans la confirmer',()=>{
  const render=renderContext();
  weldingState(render,{material:'carbone',process:'mag',need:'cadence',confirmed:[]});
  weldingClick(render,{weldingPanel:'technical',product:'arcal-speed'});
  assert.match(weldingHtml(render),/Appui ingénieur/);
  assert.match(weldingHtml(render),/À confirmer avant de retenir ARCAL/);
  assert.match(weldingHtml(render),/data-welding-confirm="fil-plein"/);
  assert.equal(vm.runInContext('weldingJourney.confirmed.length',render.context),0);
  weldingClick(render,{},['data-welding-close-panel']);
  assert.deepEqual(answerIds(weldingHtml(render)),['arcal-speed']);
  assert.match(weldingHtml(render),/Condition à confirmer/);
});

test('Sans bénéfice publié, l’argumentaire n’emprunte pas celui d’un autre gaz',()=>{
  const render=renderContext();
  weldingState(render,{material:'aluminium',process:'mig',need:'courant',confirmed:[]});
  weldingClick(render,{weldingProduct:'arcal-31'});
  const html=weldingHtml(render);
  assert.match(html,/data-argument-for="arcal-31"/);
  assert.match(html,/Aucun bénéfice comparatif n’est documenté/);
  assert.doesNotMatch(html,/moins de fumées|réduction des opérations de finition/);
  assert.match(html,/attentes du client/);
});

test('Une réponse inconnue conserve le métal connu et remplace la sélection par les informations à recueillir',()=>{
  const render=renderContext();
  weldingState(render,{material:'duplex',process:null,need:null,confirmed:[]});
  weldingClick(render,{},['data-welding-unknown']);
  assert.equal(vm.runInContext('weldingJourney.material',render.context),'duplex');
  assert.deepEqual(answerIds(weldingHtml(render)),[]);
  assert.doesNotMatch(weldingHtml(render),/data-argument-for=/);
  assert.match(weldingHtml(render),/Précisons la demande/);
  assert.match(weldingHtml(render),/data-welding-edit="process"/);
  weldingClick(render,{weldingEdit:'process'});
  assert.match(weldingHtml(render),/Comment soude-t-il/);
});

test('Modifier métal, procédé ou besoin efface les conditions et le panneau précédents',()=>{
  for(const field of ['material','process','need']){
    const render=renderContext();
    weldingState(render,{material:'carbone',process:'mag',need:'cadence',confirmed:['fil-plein'],declined:['automatique']});
    weldingClick(render,{weldingPanel:'sales',product:'arcal-speed'});
    weldingClick(render,{weldingEdit:field});
    assert.equal(vm.runInContext('weldingJourney.confirmed.length+weldingJourney.declined.length',render.context),0,field);
    assert.equal(vm.runInContext('weldingUI.selected',render.context),null,field);
    assert.equal(vm.runInContext('weldingUI.panel',render.context),null,field);
    assert.deepEqual(answerIds(weldingHtml(render)),[]);
  }
  const render=renderContext();
  weldingState(render,{material:'carbone',process:'mag',need:'cadence',confirmed:['fil-plein'],declined:['automatique']});
  weldingClick(render,{weldingField:'need',value:'courant'});
  assert.equal(vm.runInContext('weldingJourney.confirmed.length+weldingJourney.declined.length',render.context),0);
  assert.match(weldingHtml(render),/data-welding-product="arcal-speed"/);
});

test('Duplex TIG présente deux usages spécifiques sans élire automatiquement un gaz principal',()=>{
  const render=renderContext();
  weldingState(render,{material:'duplex',process:'tig',need:'courant',confirmed:[]});
  const html=weldingHtml(render);
  assert.match(html,/2 gaz à envisager/);assert.deepEqual(answerIds(html),[]);
  assert.deepEqual(candidateIds(html).slice(0,2),['arcal-39','arcal-n2-2']);
  assert.match(html,/L’ordre d’affichage ne classe pas les performances/);
  assert.match(html,/Autres usages publiés \(3\)/);
  assert.doesNotMatch(html,/data-welding-product="arcal-(?:r1-2|r1-5|m11)"/);
});

test('Un objectif sans correspondance ne promeut ni le premier autre gaz ni une condition non liée à cet objectif',()=>{
  const render=renderContext();
  weldingState(render,{material:'aluminium',process:'mig',need:'cadence',confirmed:[]});
  const html=weldingHtml(render);
  assert.deepEqual(answerIds(html),[]);
  assert.match(html,/Aucun gaz ne peut être mis en avant pour cet objectif/);
  assert.match(html,/Le respect d’une condition ne prouve pas un gain/);
  assert.deepEqual(candidateIds(html),['arcal-he70','arcal-prime','arcal-31','arcal-he20']);
  weldingClick(render,{weldingProduct:'arcal-he70'});
  assert.match(weldingHtml(render),/L’intérêt pour votre objectif reste à établir/);
});

test('L’accès direct affiche les 21 ARCAL et n’hérite pas des réponses de la sélection guidée',()=>{
  const render=renderContext();
  weldingState(render,{material:'carbone',process:'mag',need:'cadence',confirmed:['fil-plein']});
  weldingClick(render,{},['data-welding-direct']);
  assert.match(weldingHtml(render),/Je connais le gaz/);
  assert.equal(candidateIds(weldingHtml(render)).length,21);
  weldingClick(render,{weldingProduct:'arcal-speed'});
  let html=weldingHtml(render);
  assert.deepEqual(answerIds(html),['arcal-speed']);
  assert.match(html,/Application à vérifier/);assert.match(html,/Accès direct au produit/);
  assert.match(html,/Vérifions d’abord son application à votre besoin/);
  assert.doesNotMatch(html,/Fil plein confirmé|votre MAG acier avec fil plein|data-welding-unconfirm/);
  weldingClick(render,{weldingPanel:'technical',product:'arcal-speed'});
  html=weldingHtml(render);
  assert.match(html,/Aucune compatibilité n’est confirmée par cet accès direct/);
  assert.doesNotMatch(html,/Le client a déclaré utiliser un fil plein/);
  weldingClick(render,{},['data-welding-close-panel']);
  weldingClick(render,{},['data-welding-results']);
  assert.equal(candidateIds(weldingHtml(render)).length,21);
  weldingClick(render,{},['data-welding-guided']);
  assert.deepEqual(answerIds(weldingHtml(render)),['arcal-speed']);
  assert.match(weldingHtml(render),/Fil plein confirmé par le client/);
});

test('Les appuis commercial, technique et préparation restent reliés au produit et au retour',()=>{
  const render=renderContext();
  weldingState(render,{material:'carbone',process:'mag',need:'cadence',confirmed:['fil-plein']});
  weldingClick(render,{weldingPanel:'sales',product:'arcal-speed'});
  let html=weldingHtml(render);
  assert.match(html,/Appui commercial/);assert.match(html,/Votre gaz est plus cher/);
  assert.match(html,/Mon gaz actuel me convient/);assert.match(html,/Changer va perturber la production/);
  assert.match(html,/coût d’une pièce conforme/);assert.match(html,/données manquantes/);
  assert.equal((html.match(/class="welding-disclosure welding-objection"/g)||[]).length,4);
  weldingClick(render,{},['data-welding-close-panel']);
  assert.deepEqual(answerIds(weldingHtml(render)),['arcal-speed']);
  weldingClick(render,{weldingPanel:'technical',product:'arcal-speed'});
  html=weldingHtml(render);
  assert.match(html,/Appui ingénieur/);assert.match(html,/Cette information ne qualifie pas l’application/);
  assert.match(html,/Ne pas transposer automatiquement les réglages/);assert.match(html,/Source Air Liquide/);
  weldingClick(render,{},['data-welding-close-panel']);
  weldingClick(render,{weldingPanel:'next',product:'arcal-speed'});
  html=weldingHtml(render);
  assert.match(html,/Préparer une proposition/);assert.match(html,/Organiser une comparaison/);
  assert.match(html,/Pour construire l’offre/);assert.match(html,/consommation réelle/);
  assert.match(html,/prix et services à confirmer/);
});

test('Ouvrir une alternative ne la duplique pas dans les listes de résultats',()=>{
  for(const [journey,id] of [
    [{material:'duplex',process:'tig',need:'courant',confirmed:[]},'arcal-39'],
    [{material:'carbone',process:'mag',need:'cadence',confirmed:['fil-plein']},'arcal-force']
  ]){
    const render=renderContext();weldingState(render,journey);
    weldingClick(render,{weldingProduct:id});
    const html=weldingHtml(render),candidates=candidateIds(html);
    assert.deepEqual(answerIds(html),[id]);assert.ok(!candidates.includes(id));
    assert.equal(new Set(candidates).size,candidates.length);
    assert.match(html,/data-welding-results/);
  }
});

test('Retirer la déclaration de mode automatique remet le besoin en question',()=>{
  const render=renderContext();
  weldingState(render,{material:'aluminium',process:'mig',need:'automatique',confirmed:[]});
  assert.deepEqual(answerIds(weldingHtml(render)),['arcal-he70']);
  assert.match(weldingHtml(render),/Mode automatique confirmé par le client/);
  weldingClick(render,{weldingUnconfirm:'automatique'});
  assert.equal(vm.runInContext('weldingJourney.need',render.context),null);
  assert.deepEqual(answerIds(weldingHtml(render)),[]);
  assert.match(weldingHtml(render),/Qu’est-ce qui compte pour lui/);
});

test('Nouvelle demande efface le contexte, les confirmations et les choix d’accès direct',()=>{
  const render=renderContext();
  weldingState(render,{material:'carbone',process:'mag',need:'cadence',confirmed:['fil-plein'],declined:['automatique']});
  weldingClick(render,{},['data-welding-direct']);
  weldingClick(render,{weldingProduct:'arcal-speed'});
  weldingClick(render,{weldingPanel:'sales',product:'arcal-speed'});
  weldingClick(render,{},['data-welding-reset']);
  assert.equal(vm.runInContext('weldingUI.mode',render.context),'guide');
  assert.equal(vm.runInContext('weldingUI.selected',render.context),null);
  assert.equal(vm.runInContext('weldingUI.panel',render.context),null);
  assert.equal(vm.runInContext('weldingJourney.material',render.context),null);
  assert.equal(vm.runInContext('weldingJourney.confirmed.length+weldingJourney.declined.length',render.context),0);
  assert.match(weldingHtml(render),/Quel métal souder/);
  assert.deepEqual(answerIds(weldingHtml(render)),[]);
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
    vm.runInContext('detail(product)',context);const html=element('#main').innerHTML;
    assert.ok(html.includes('Réf. '+escapeHtml(product.welding.manufacturerCode)),`${product.id} : code fabricant visible dans l’en-tête`);
    const essential=fichePanel(html,'essential'),technical=fichePanel(html,'technical'),safety=fichePanel(html,'safety');
    for(const use of product.welding.uses)assert.ok((product.consultation?html:essential).includes(escapeHtml(use.detail)),product.id);
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

test('Outils remplace Repères et donne accès aux trois rubriques sans perdre les informations du guide',()=>{
  const {context,element}=renderContext();vm.runInContext('reperes()',context);
  assert.match(element('#main').innerHTML,/#convertisseur/);assert.match(element('#main').innerHTML,/#glossaire/);
  assert.match(element('.bottom-nav').innerHTML,/>Outils</);
  vm.runInContext('guideAbout()',context);assert.match(element('#main').innerHTML,/64 fiches/);assert.match(element('#main').innerHTML,/theme-select/);
});
test('Changer le gaz efface la quantité et le résultat hérité tout en conservant les unités',()=>{
  const render=renderContext();const {context,element}=render;
  vm.runInContext("converterState={entryId:'azote',choosing:false,category:'gas',phase:'gaz',from:'m³',to:'kg',value:'1',search:'',direction:'liquide-gaz'};converter()",context);
  assert.match(element('#main').innerHTML,/1,1848/);
  weldingClick(render,{converterEntry:'oxygene'});
  assert.equal(vm.runInContext('converterState.value',context),'');
  assert.match(element('#main').innerHTML,/Oxygène/);assert.doesNotMatch(element('#main').innerHTML,/1,1848|<output/);
});
test('La commande ± change le signe sans perdre les décimales françaises ni les unités',()=>{
  const render=renderContext();const {context,element}=render;
  vm.runInContext("converterState={entryId:'azote',choosing:false,category:'temperature',from:'°C',to:'K',value:'196,5'};converter()",context);
  weldingClick(render,{},['data-converter-sign']);
  assert.equal(vm.runInContext('converterState.value',context),'-196,5');
  assert.equal(element('#conversion-value').value,'-196,5');
  assert.match(element('#conversion-output').innerHTML,/76,65/);
  weldingClick(render,{},['data-converter-sign']);
  assert.equal(vm.runInContext('converterState.value',context),'196,5');
  assert.match(element('#conversion-output').innerHTML,/469,65/);
});
