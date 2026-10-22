import {ficheMarkup, sheetStates} from './fiche.js';
import { iconMarkup } from './ui-icons.js';
import { ESSENTIAL_IDS, catalogueSelection, readFavorites, escapeHtml as esc } from './core.js';
import { weldingAdvice } from './welding-advice.js';
import {toolsHomeMarkup,glossaryMarkup,glossaryListMarkup,converterMarkup,converterOutputMarkup,converterGasListMarkup,CONVERTER_DEFAULTS} from './tools-ui.js';
import { MATERIALS, PROCESSES, NEEDS, availableProcesses, weldingSelection } from './welding.js';
const $ = s => document.querySelector(s);
const icon = (key, cls='') => (iconMarkup[key] || '').replace('<svg ', `<svg aria-hidden="true" focusable="false" class="icon ${cls}" `);
const brand = '<img class="brand" src="./icons/brand-cobalt-128.png" alt="" width="48" height="48">';
const allEntries = () => [...data.gases, ...(data.products || [])];
let data, favorites = new Set(), query = '', mode = 'essentials', catalogueScroll = 0, catalogueOverview = true, toastTimer, offlineReady = false, waitingWorker;
let weldingJourney={group:null,material:null,process:null,need:null,confirmed:[]};

const fmt = n => new Intl.NumberFormat('fr-FR', {maximumFractionDigits:4}).format(n).replace('-', '−');
const themeNames = {system:'Automatique',light:'Clair',dark:'Sombre'};
function theme() { return document.documentElement.dataset.theme || 'system'; }
function applyTheme(next) {
  document.documentElement.dataset.theme = next;
  try {localStorage.setItem('guide-gaz-theme', next);} catch { toast('Le thème ne peut pas être enregistré sur cet appareil.'); }
  syncTheme();
}
function syncTheme() {
  const dark = theme() === 'dark' || (theme() === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name="theme-color"]').content = dark ? '#111217' : '#ffffff';
  document.querySelectorAll('[data-theme-cycle]').forEach(b => { b.innerHTML = icon(theme() === 'system' ? 'system' : theme() === 'dark' ? 'moon' : 'sun'); b.setAttribute('aria-label', `Thème ${themeNames[theme()].toLowerCase()} : changer le thème`); b.title = `Thème : ${themeNames[theme()]}`; });
  const select = $('#theme-select'); if (select) select.value = theme();
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncTheme);
function toast(message) { clearTimeout(toastTimer); $('#toast').textContent=message; $('#toast').hidden=false; toastTimer=setTimeout(()=>$('#toast').hidden=true,4000); }
const formulaClass = g => g.displayFormula.length > 4 ? 'formula compact' : 'formula';
const themeButton = () => '<button class="icon-button theme-button" data-theme-cycle aria-label="Changer le thème"></button>';
function bookmark(g) { return `<button class="icon-button favorite ${favorites.has(g.id)?'is-saved':''}" data-favorite="${g.id}" aria-pressed="${favorites.has(g.id)}" aria-label="${favorites.has(g.id)?'Retirer des favoris':'Ajouter aux favoris'} : ${esc(g.name)}">${icon('bookmark')}</button>`; }
function nav(active) { $('.bottom-nav').innerHTML = `<a href="#catalogue" data-home ${active==='catalogue'?'aria-current="page"':''}><span class="nav-art nav-art-catalogue" aria-hidden="true"></span><span>Catalogue</span></a><a href="#soudage" ${active==='soudage'?'aria-current="page"':''}><span class="nav-art nav-art-welding" aria-hidden="true"></span><span>Soudage</span></a><a href="#gammes" ${active==='gammes'?'aria-current="page"':''}><span class="nav-art nav-art-ranges" aria-hidden="true"></span><span>Gammes</span></a><a href="#reperes" ${active==='reperes'?'aria-current="page"':''}><span class="nav-art nav-art-references" aria-hidden="true"></span><span>Outils</span></a>`; }
function intro(title, subtitle) { return `<div class="topbar">${brand}${themeButton()}</div><header class="page-title"><h1 tabindex="-1">${title}</h1><p>${subtitle}</p></header>`; }
/* Proposition d’intégration : remplacer catalogue(), renderList() et gasRows().
 * Dépendances inchangées de app.js : $, icon, brand, data, allEntries,
 * favorites, query, mode, catalogueOverview, ESSENTIAL_IDS,
 * catalogueSelection(), formulaClass(), esc(), nav().
 * Conserver les gestionnaires existants data-mode/data-home/data-clear.
 * Le gestionnaire data-risk ci-dessous s’ajoute une seule fois.
 * Dans les gestionnaires data-mode et data-home existants, ajouter
 * catalogueRisk='all' pour qu’une nouvelle vue reparte sans filtre résiduel.
 * Aucun code issu du runtime des exports HTML n’est requis.
 */
let catalogueRisk='all';
const catalogueRiskOptions=[
  ['all','Tous'],['inflammable','Inflammable'],['comburant','Comburant'],
  ['toxique','Toxique'],['corrosif','Corrosif'],['asphyxiant','Asphyxiant'],
  ['pyrophorique','Pyrophorique'],['undocumented','Dangers non détaillés']
];
const catalogueRiskKeys=new Set(catalogueRiskOptions.map(([key])=>key));
function catalogueRiskLabels(g){
  if(g.kind==='product'){
    // Aucun transfert de danger depuis les constituants ou la composition.
    // « Ininflammable » doit rester distinct d’« inflammable ».
    return g.welding?.safety?.flammability?[g.welding.safety.flammability]:[];
  }
  const labels=g.family.split(' · ').map(label=>label.trim()).filter(Boolean);
  // Synthèse d’un danger déjà écrit dans la fiche, jamais déduit d’« inerte ».
  if(g.risks.some(text=>/asphyx/i.test(text))&&!labels.some(label=>/asphyx/i.test(label)))labels.push('Asphyxiant');
  return labels;
}
function catalogueRiskKey(label){
  const normalized=label.toLocaleLowerCase('fr').trim();
  if(normalized==='extrêmement inflammable'||normalized==='extrêmement inflammable selon la fiche produit')return 'inflammable';
  return catalogueRiskKeys.has(normalized)?normalized:'';
}
function matchesCatalogueRisk(g,key){
  if(key==='all')return true;
  const labels=catalogueRiskLabels(g);
  if(key==='undocumented')return g.kind==='product'&&!labels.length;
  return labels.some(label=>catalogueRiskKey(label)===key);
}
function catalogueRiskMarkup(g){
  const labels=catalogueRiskLabels(g);
  if(!labels.length)return '<span class="catalogue-risk-label undocumented">Dangers non détaillés · voir FDS</span>';
  return labels.map(label=>{
    const key=catalogueRiskKey(label)||'neutral';
    return `<span class="catalogue-risk-label"><i class="risk-dot risk-${key}" aria-hidden="true"></i>${esc(label)}</span>`;
  }).join('');
}
function catalogueFilterMarkup(){
  return `<div class="catalogue-risk-filters" role="group" aria-label="Filtrer par libellé de risque publié">${catalogueRiskOptions.map(([key,label])=>`<button type="button" data-risk="${key}" aria-pressed="${catalogueRisk===key}">${key==='all'||key==='undocumented'?'':`<i class="risk-dot risk-${key}" aria-hidden="true"></i>`}${label}</button>`).join('')}</div>`;
}
function catalogueHomeMarkup(){
  const quick=['oxygene','azote','argon','dioxyde-carbone'].map(id=>data.gases.find(g=>g.id===id));
  const quickRisk=g=>{const label=catalogueRiskLabels(g).find(value=>catalogueRiskKey(value))||g.family;return `<span class="catalogue-risk-label"><i class="risk-dot risk-${catalogueRiskKey(label)||'neutral'}" aria-hidden="true"></i>${esc(label)}</span>`;};
  return `<section class="reference-quick"><div class="reference-section-heading"><h2>Accès rapides</h2><button type="button" data-mode="essentials">12 essentiels ${icon('chevron')}</button></div><ul class="reference-quick-grid">${quick.map(g=>`<li><a href="#gaz/${g.id}"><strong>${esc(g.displayFormula)}</strong><span>${esc(g.name)}</span><small>${quickRisk(g)}</small></a></li>`).join('')}</ul></section><section class="reference-ranges"><div class="reference-section-heading"><h2>Gammes</h2><a href="#gammes">Toutes ${icon('chevron')}</a></div><ul class="reference-range-list"><li><a href="#gamme/arcal"><span><strong>ARCAL™</strong><small>Soudage</small></span>${icon('chevron')}</a></li><li><a href="#gamme/aligal"><span><strong>ALIGAL™</strong><small>Alimentaire</small></span>${icon('chevron')}</a></li></ul></section><button type="button" class="reference-all-catalogue" data-mode="all">${icon('book')}<span><strong>Catalogue complet</strong><small>${allEntries().length} fiches · essentiels puis A à Z</small></span>${icon('chevron')}</button>`;
}
function catalogue(){
  $('#main').innerHTML=`<div class="reference-catalogue"><header id="catalogue-home-header" class="reference-masthead"><div class="reference-wordmark">${brand}<div><p>Guide des gaz</p><small>Guide indépendant</small></div></div><button type="button" class="icon-button reference-favorites" data-mode="favorites" aria-label="Voir les favoris">${icon('bookmark')}</button></header><header id="catalogue-list-header" class="reference-catalogue-header" hidden><a href="#catalogue" data-home aria-label="Retour à l’accueil">${icon('back')}</a><h1 id="catalogue-heading" tabindex="-1">Catalogue</h1><span>${allEntries().length} fiches</span></header><div id="catalogue-search-hero" class="reference-search-hero"><h1 id="catalogue-home-heading" tabindex="-1">Quel gaz cherchez-vous ?</h1><div class="search-wrap reference-search">${icon('search')}<label class="sr-only" for="search">Rechercher dans les ${allEntries().length} fiches par nom, formule, gamme ou référence</label><input id="search" type="search" placeholder="Nom, formule, gamme…" value="${esc(query)}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="search-help"><button type="button" id="clear-search" class="icon-button" aria-label="Effacer la recherche" ${query?'':'hidden'}>${icon('close')}</button></div><p id="search-help" class="search-help" hidden></p></div><div id="catalogue-home">${catalogueHomeMarkup()}</div><div id="catalogue-results" hidden><div id="catalogue-filters">${catalogueFilterMarkup()}</div><div id="catalogue-active-scope" class="catalogue-active-scope"></div><div class="list-heading reference-list-heading"><h2 id="list-title" tabindex="-1"></h2><p id="result-count" role="status"></p></div><p id="list-caption" class="list-caption"></p><ul id="gas-list" class="gas-list reference-gas-list"></ul><section id="other-gases" class="reference-other-gases" hidden><h2 class="sr-only">Autres gaz et produits par ordre alphabétique</h2><ul id="other-gas-list" class="gas-list reference-gas-list"></ul></section><div id="empty" class="empty" hidden></div><p class="catalogue-risk-coverage">Filtres fondés sur les libellés déjà documentés. Les produits dont les dangers ne sont pas détaillés ne sont pas inclus dans un filtre de danger ciblé. Consulter leur FDS.</p></div><p class="reference-catalogue-footer">Édition ${esc(data.version)} · Sources publiques</p></div>`;
  nav('catalogue');renderList();
  $('#search').addEventListener('input',e=>{query=e.target.value;renderList();});
  $('#clear-search').addEventListener('click',()=>{query='';$('#search').value='';renderList();$('#search').focus();});
}
function gasRows(gases){
  return gases.map(g=>`<li><a class="gas-row" href="#gaz/${g.id}">${g.kind==='product'?'<span class="formula commercial-mark" aria-hidden="true">'+icon('layers')+'</span>':`<span class="${formulaClass(g)}" aria-label="${g.formula?'Formule '+esc(g.formula):'Air, mélange'}">${esc(g.displayFormula)}</span>`}<span class="gas-text"><strong>${esc(g.name)}</strong>${g.kind==='product'?`<span class="commercial-family">${esc(g.family)}</span>`:''}<span class="catalogue-row-risks">${catalogueRiskMarkup(g)}</span></span>${favorites.has(g.id)?icon('bookmark','saved-indicator'):''}${icon('chevron','chevron')}</a></li>`).join('');
}
function catalogueAlphabetRows(entries){
  let previous='';
  return entries.map(g=>{
    // orderGases() place déjà les entrées restantes dans l’ordre français.
    // Les chiffres restent un groupe explicite ; aucune normalisation d’identité.
    const letter=g.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').charAt(0).toLocaleUpperCase('fr');
    const group=/\d/.test(letter)?'0–9':letter;
    const heading=group!==previous?`<li class="catalogue-letter"><h3>${esc(group)}</h3></li>`:'';
    previous=group;return heading+gasRows([g]);
  }).join('');
}
function renderList(){
  const searching=!!query.trim(),overview=catalogueOverview&&!searching;
  $('#catalogue-home-header').hidden=!overview;$('#catalogue-home-heading').hidden=!overview;
  $('#catalogue-list-header').hidden=overview;$('#catalogue-home').hidden=!overview;
  $('#catalogue-results').hidden=overview;
  $('#catalogue-search-hero').classList.toggle('is-list',!overview);
  $('#search').placeholder=overview?'Nom, formule, gamme…':'Nom ou formule';
  // Ne jamais laisser un ancien filtre cacher les résultats d’une nouvelle recherche.
  // Les saisies couvrent toujours les 115 fiches, conformément à core.js.
  const risk=searching?'all':catalogueRisk;
  const result=catalogueSelection(allEntries(),query,mode,favorites).filter(g=>matchesCatalogueRisk(g,risk));
  const grouped=mode==='all'&&!searching;
  const primary=grouped?result.filter(g=>ESSENTIAL_IDS.includes(g.id)):result;
  const other=grouped?result.filter(g=>!ESSENTIAL_IDS.includes(g.id)):[];
  $('#catalogue-filters').innerHTML=catalogueFilterMarkup();
  $('#catalogue-filters').hidden=searching;
  $('#list-title').textContent=searching?'Résultats':mode==='favorites'?'Vos favoris':mode==='essentials'?'Les 12 essentiels':primary.length?'Les essentiels':'Autres gaz & produits';
  $('#result-count').textContent=searching?`${result.length} résultat${result.length!==1?'s':''}`:`${result.length} fiche${result.length!==1?'s':''}`;
  $('#list-caption').textContent=searching?`Recherche dans les ${allEntries().length} fiches du catalogue.`:mode==='favorites'?'Les fiches que vous avez enregistrées.':mode==='essentials'?'Une sélection pour l’industrie.':'Les principaux gaz d’abord, puis les autres fiches par ordre alphabétique.';
  $('#catalogue-active-scope').innerHTML=!searching&&mode!=='all'?`<span>${mode==='favorites'?'Favoris':'Sélection essentielle'}</span><button type="button" data-mode="all">Voir tout</button>`:'';
  $('#clear-search').hidden=!query;
  const atomic={O:'O désigne l’élément oxygène. Le gaz de cette fiche est O₂ (saisir O2).',N:'N désigne l’élément azote. Le gaz de cette fiche est N₂ (saisir N2).',H:'H désigne l’élément hydrogène. Le gaz de cette fiche est H₂ (saisir H2).',Co:'Co est le symbole du cobalt. Pour le monoxyde de carbone, saisir CO (deux majuscules).'};
  $('#search-help').textContent=atomic[query.trim()]||'';$('#search-help').hidden=!atomic[query.trim()];
  $('#gas-list').innerHTML=gasRows(primary);$('#gas-list').hidden=!primary.length;
  $('#other-gas-list').innerHTML=catalogueAlphabetRows(other);$('#other-gases').hidden=!other.length;
  $('#empty').hidden=!!result.length;
  $('#empty').innerHTML=mode==='favorites'&&!searching&&catalogueRisk==='all'?`${icon('bookmark')}<h2>Vos essentiels, ici.</h2><p>Ouvrez une fiche et touchez le marque-page pour la retrouver rapidement.</p><button class="text-button" data-mode="essentials">Explorer les essentiels</button>`:`${icon('search')}<h2>Aucun gaz trouvé</h2><p>${searching?`Essayez un nom, O2, CO₂, LOX ou un numéro CAS. La recherche couvre les ${allEntries().length} fiches.`:'Aucune fiche de cette sélection ne porte le libellé choisi.'}</p><button class="text-button" ${searching?'data-clear':'data-risk="all"'}>${searching?'Effacer la recherche':'Retirer le filtre de risque'}</button>`;
}
document.addEventListener('click',e=>{
  const button=e.target.closest('button[data-risk]');if(!button)return;
  const next=button.dataset.risk;if(!catalogueRiskKeys.has(next))return;
  catalogueRisk=next;renderList();
  document.querySelector(`[data-risk="${next}"]`)?.focus({preventScroll:true});
});

function sourceLinks(sources) { return sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${icon('external')}<span><strong>${esc(s.title)}</strong><small>${esc(s.scope)}${s.checked?' · Consultation : '+esc(s.checked):''}</small></span>${icon('chevron','chevron')}</a></li>`).join(''); }
const selectionName=(options,id)=>options.find(x=>x.id===id)?.name||'';
const weldingMaterialGroups=[
  {id:'acier',name:'Acier carbone',detail:'Non ou faiblement allié',materials:['carbone']},
  {id:'inox',name:'Inox',detail:'Nuance connue ou à préciser',materials:['inox','austenitique','duplex','inox-azote']},
  {id:'aluminium',name:'Aluminium',detail:'Aluminium et ses alliages',materials:['aluminium']},
  {id:'autre',name:'Autre métal',detail:'Acier revêtu, cuivre, nickel…',materials:['revetu','armatures','cuivre','nickel']}
];
const weldingChoiceLabels={
  inox:{name:'Nuance à préciser',detail:'Je ne connais pas encore le type d’inox'},
  austenitique:{name:'Inox austénitique',detail:'Type confirmé par le client'},
  duplex:{name:'Duplex / Superduplex',detail:'Type confirmé par le client'},
  'inox-azote':{name:'Inox enrichi en azote',detail:'Type confirmé par le client'},
  courant:{name:'Trouver un gaz adapté',detail:'Pour l’application du client'},
  finition:{name:'Améliorer la finition',detail:'Aspect du cordon et reprises'},
  cadence:{name:'Gagner en productivité',detail:'Temps de soudage et organisation'},
  fin:{name:'Tôles fines',detail:'Épaisseur exacte à relever'},
  epais:{name:'Pièces épaisses',detail:'Épaisseur exacte à relever'},
  automatique:{name:'Automatique / robotisé',detail:'Mode de travail confirmé par le client'}
};
const weldingConfirmations={
  'fil-plein':{question:'Le client utilise-t-il un fil plein ?',yes:'Oui, fil plein',known:'Fil plein confirmé par le client'},
  'fil-fourre-inox':{question:'Le fil est-il un fil fourré inox adapté ?',yes:'Oui, fil fourré inox adapté',known:'Fil fourré inox confirmé par le client'},
  'pulse-fil-plein':{question:'Le client travaille-t-il en MAG pulsé avec fil plein ?',yes:'Oui, MAG pulsé et fil plein',known:'MAG pulsé et fil plein confirmés par le client'},
  automatique:{question:'Le soudage est-il automatique ?',yes:'Oui, mode automatique',known:'Mode automatique confirmé par le client'}
};
let weldingUI={mode:'guide',selected:null,panel:null,search:''};
function weldingChoice(options,field){
  return `<ul class="choice-list">${options.map(original=>{const o={...original,...weldingChoiceLabels[original.id]};return `<li><button data-welding-field="${field}" data-value="${esc(o.id)}"><span><strong>${esc(o.name)}</strong><small>${esc(o.detail)}</small></span>${icon('chevron','chevron')}</button></li>`;}).join('')}</ul>`;
}
function weldingContext(){
  return [selectionName(MATERIALS,weldingJourney.material),selectionName(PROCESSES,weldingJourney.process)].filter(Boolean).join(' · ');
}
function weldingSource(product){
  const source=product.sources.find(s=>s.url===product.sourceUrl);
  return `<a class="welding-source" href="${esc(product.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source Air Liquide ${icon('external')}</a><span class="welding-source-date">Consultée le ${esc(source?.checked||'21 octobre 2026')} · document en ligne</span>`;
}
function weldingCondition(m){
  if(!m)return '';
  if(m.condition){
    const c=weldingConfirmations[m.condition.key];
    return `<div class="welding-condition"><strong>${c?esc(c.question):'Application à préciser'}</strong><p>${esc(m.condition.text)}</p>${c?`<div class="welding-confirm-actions"><button class="welding-primary" data-welding-confirm="${esc(m.condition.key)}">${esc(c.yes)}</button><button class="welding-text" data-welding-decline="${esc(m.condition.key)}">Non</button>${weldingUI.panel==='technical'?'':`<button class="welding-text" data-welding-panel="technical" data-product="${esc(m.product.id)}">Je ne sais pas</button>`}</div>`:'<p>Faire préciser ce point avec le référent soudage avant de retenir ce gaz.</p>'}</div>`;
  }
  if(m.confirmedCondition){
    const c=weldingConfirmations[m.confirmedCondition.key];
    return `<div class="welding-confirmed"><span>${esc(c?.known||m.confirmedCondition.text)}</span><button class="welding-text" data-welding-unconfirm="${esc(m.confirmedCondition.key)}">Modifier</button></div>`;
  }
  return '';
}
function weldingRisk(product){return product.welding.safety.classificationCode==='1F'?'<p class="welding-risk">Extrêmement inflammable selon la fiche produit. Consulter la FDS.</p>':'';}
function weldingMatchStatus(m){
  if(!m)return 'Application à vérifier';
  if(m.condition)return 'Condition à confirmer';
  if(weldingJourney.material==='inox')return 'Nuance inox à préciser';
  if(weldingJourney.need!=='courant'&&!m.needMatch)return 'Objectif à vérifier';
  return m.specific?'Usage correspondant':'Usage général publié';
}
function weldingProductDetail(product,m,{back=false}={}){
  const a=weldingAdvice(product,weldingJourney,m);
  return `${back?`<button class="welding-back" data-welding-results>${icon('back')}${weldingUI.mode==='direct'?'Tous les ARCAL':'Tous les résultats'}</button>`:''}
    <article class="welding-answer" data-answer-for="${esc(product.id)}">
      <p class="welding-kicker">${esc(weldingMatchStatus(m))}</p><h2 id="welding-question" tabindex="-1">${esc(product.name)}</h2>
      <p class="welding-why">${esc(m?.why||product.welding.uses[0]?.detail||'Consulter les utilisations documentées dans la fiche.')}</p>
      ${weldingCondition(m)}${weldingRisk(product)}
      ${!m?'<p class="welding-notice">Accès direct au produit : le métal, le procédé et les conditions d’emploi restent à vérifier.</p>':''}
      <section class="welding-pitch"><h3>À dire au client</h3><p>« ${esc(a.pitch)} »</p></section>
      <div class="welding-actions"><button data-welding-panel="sales" data-product="${esc(product.id)}"><span>Répondre au client<small>Prix, gaz actuel, qualité, changement</small></span>${icon('chevron')}</button><button data-welding-panel="technical" data-product="${esc(product.id)}"><span>Vérifier la technique<small>Points à confirmer avec le client</small></span>${icon('chevron')}</button></div>
      <button class="welding-primary welding-next" data-welding-panel="next" data-product="${esc(product.id)}">Préparer la suite ${icon('chevron')}</button>
      <a class="welding-sheet" href="#gaz/${esc(product.id)}">Fiche, formats & FDS ${icon('chevron')}</a>
      <details class="welding-disclosure" data-argument-for="${esc(product.id)}"><summary><span>L’intérêt documenté<small>Bénéfices et source du produit</small></span>${icon('chevron')}</summary><div>${a.benefits.length?a.benefits.map(b=>`<p>${esc(b.text)}</p>`).join(''):'<p>Aucun bénéfice comparatif n’est documenté pour ce produit dans les sources consultées. Partir de l’usage publié et des attentes du client.</p>'}${weldingSource(product)}</div></details>
      <p class="welding-note">Piste à valider avec le référent soudage et le mode opératoire. Les formulations commerciales sont proposées par le guide.</p>
    </article>`;
}
function weldingCards(matches){
  return `<ul class="welding-candidates">${matches.map(m=>`<li><button data-welding-product="${esc(m.product.id)}"><span><strong>${esc(m.product.name)}</strong><small>${esc(m.why)}</small><em>${esc(weldingMatchStatus(m))}</em></span>${icon('chevron')}</button></li>`).join('')}</ul>`;
}
function weldingSelectionForView(){
  const result=weldingSelection(data.products,weldingJourney),declined=weldingJourney.declined||[];
  return {...result,conditional:result.conditional.filter(m=>!declined.includes(m.condition.key))};
}
function weldingCurrentMatch(productId){
  if(weldingUI.mode==='direct')return null;
  const r=weldingSelectionForView();return [...r.focused,...r.conditional,...r.other].find(m=>m.product.id===productId)||null;
}
function weldingPanel(product){
  const m=weldingCurrentMatch(product.id),a=weldingAdvice(product,weldingJourney,m),panel=weldingUI.panel;
  const titles={sales:'Répondre au client',technical:'Vérifier la technique',next:'Préparer la suite'};
  let body='';
  if(panel==='sales')body=`<section class="welding-discovery"><h3>Pour comprendre son enjeu</h3><p>« ${esc(a.question)} »</p></section>${a.objections.map(o=>`<details class="welding-disclosure welding-objection"><summary>${esc(o.title)}${icon('chevron')}</summary><div><h3>Votre réponse</h3><p>« ${esc(o.response)} »</p><h3>Pour approfondir</h3><p>« ${esc(o.question)} »</p><h3>La suite à proposer</h3><p>${esc(o.next)}</p></div></details>`).join('')}<p class="welding-note">Conseils d’entretien du guide, à adapter au client. Les faits produit figurent dans « L’intérêt documenté ».</p>`;
  if(panel==='technical')body=`${weldingCondition(m)}${weldingRisk(product)}<p class="welding-panel-intro">Les points à examiner avec le client et son référent soudage.</p><ul class="welding-checklist">${a.technical.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><details class="welding-disclosure"><summary>Usages publiés pour ce produit ${icon('chevron')}</summary><div>${product.welding.uses.map(u=>`<h3>${esc(u.title)}</h3><p>${esc(u.detail)}</p>`).join('')}${weldingSource(product)}</div></details><p class="welding-notice">Le choix du gaz ne remplace pas la validation du mode opératoire. Aucun débit ni réglage n’est prescrit ici.</p>`;
  if(panel==='next')body=`<p class="welding-panel-intro">Choisir la prochaine action selon ce qui est déjà confirmé.</p>${a.nextSteps.map(n=>`<details class="welding-disclosure"><summary>${esc(n.title)}${icon('chevron')}</summary><div><p>${esc(n.text)}</p></div></details>`).join('')}<section class="welding-offer"><h3>Pour construire l’offre</h3><ul class="welding-checklist">${a.offer.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></section><p class="welding-note">Conditionnement, disponibilité, prix et services à confirmer dans l’offre réelle.</p>`;
  return `<button class="welding-back" data-welding-close-panel>${icon('back')}Retour à ${esc(product.name)}</button><p class="welding-kicker">${panel==='technical'?'Appui ingénieur':'Appui commercial'} · ${esc(product.name)}</p><h2 id="welding-question" tabindex="-1">${titles[panel]}</h2>${body}<a class="welding-sheet" href="#gaz/${esc(product.id)}">Fiche, formats & FDS ${icon('chevron')}</a>`;
}
function weldingDirectList(){
  const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const search=normalize(weldingUI.search.trim());
  const products=data.products.filter(g=>g.range==='arcal'&&normalize(g.name+' '+g.welding.manufacturerCode).includes(search));
  return products.length?['Référents','Techniques'].map(category=>{
    const rows=products.filter(g=>g.welding.category===category);if(!rows.length)return '';
    return `<h3 class="welding-list-label">${category==='Référents'?(search?'Référents':'Les 4 Référents'):'Les Techniques'}</h3><ul class="welding-direct-list">${rows.map(g=>`<li><button data-welding-product="${esc(g.id)}"><span><strong>${esc(g.name)}</strong><small>${esc(g.welding.uses[0]?.title||g.welding.manufacturerCode)}</small></span>${icon('chevron')}</button></li>`).join('')}</ul>`;
  }).join(''):'<p class="welding-notice" role="status">Aucun ARCAL trouvé. Essayez son nom ou sa référence fabricant.</p>';
}
function weldingGuide(){
  const s=weldingJourney,step=!s.material?1:!s.process?2:!s.need?3:4;
  let content='',context='';
  const product=weldingUI.selected?data.products.find(g=>g.range==='arcal'&&g.id===weldingUI.selected):null;
  if(weldingUI.panel&&product)content=weldingPanel(product);
  else if(weldingUI.mode==='direct'){
    content=product?weldingProductDetail(product,null,{back:true}):`<button class="welding-back" data-welding-guided>${icon('back')}Trouver un gaz adapté</button><h2 id="welding-question" tabindex="-1">Je connais le gaz</h2><p class="welding-panel-intro">Retrouvez son argumentaire et ses points techniques.</p><div class="search-wrap"><label class="sr-only" for="welding-search">Chercher un gaz ARCAL</label>${icon('search')}<input id="welding-search" type="search" placeholder="Nom ou référence ARCAL" value="${esc(weldingUI.search)}" autocomplete="off"><button class="icon-button" data-welding-clear-search aria-label="Effacer la recherche">${icon('close')}</button></div><div id="welding-products">${weldingDirectList()}</div>`;
  } else if(step===1){
    const group=weldingMaterialGroups.find(g=>g.id===s.group);
    content=group?`<button class="welding-back" data-welding-edit="material">${icon('back')}Tous les métaux</button><h2 id="welding-question" tabindex="-1">${group.id==='inox'?'Quel type d’inox ?':'Quel métal ?'}</h2><p class="welding-panel-intro">Reprendre l’information du client.</p>${weldingChoice(group.materials.map(id=>MATERIALS.find(m=>m.id===id)),'material')}${group.id==='inox'?'':'<button class="welding-text" data-welding-unknown>Je ne sais pas encore</button>'}`:
    `<p class="welding-kicker">Trouver un gaz adapté</p><h2 id="welding-question" tabindex="-1">Quel métal souder ?</h2><p class="welding-panel-intro">Le métal, le procédé, puis le besoin du client.</p><ul class="welding-metal-grid">${weldingMaterialGroups.map(g=>`<li><button data-welding-group="${g.id}"><span><strong>${g.name}</strong><small>${g.detail}</small></span>${icon('chevron')}</button></li>`).join('')}</ul><button class="welding-text welding-unknown" data-welding-unknown>Je ne sais pas encore</button><button class="welding-entry" data-welding-direct><span><strong>Je connais le gaz</strong><small>Accès direct à l’argumentaire ARCAL</small></span>${icon('chevron')}</button>`;
  } else if(step===2){
    const options=availableProcesses(s.material),common=options.filter(p=>['mig','mag','tig'].includes(p.id)),other=options.filter(p=>!['mig','mag','tig'].includes(p.id));
    content=`<p class="welding-kicker">Le procédé</p><h2 id="welding-question" tabindex="-1">Comment soude-t-il ?</h2><p class="welding-panel-intro">Le nom indiqué par le client ou son mode opératoire.</p>${weldingChoice(common.length?common:other,'process')}${common.length&&other.length?`<details class="welding-disclosure"><summary>Autres procédés et protections ${icon('chevron')}</summary>${weldingChoice(other,'process')}</details>`:''}<button class="welding-text" data-welding-unknown>Je ne sais pas</button>`;
  } else if(step===3){
    content=`<p class="welding-kicker">Le besoin</p><h2 id="welding-question" tabindex="-1">Qu’est-ce qui compte pour lui ?</h2>${weldingChoice(['courant','finition','cadence'].map(id=>NEEDS.find(n=>n.id===id)),'need')}<details class="welding-disclosure"><summary>Une application plus précise ${icon('chevron')}</summary>${weldingChoice(NEEDS.filter(n=>!['courant','finition','cadence'].includes(n.id)),'need')}</details>`;
  } else if(s.process==='unknown'||s.material==='unknown'){
    content=`<h2 id="welding-question" tabindex="-1">Précisons la demande</h2><p class="welding-panel-intro">Pour trouver un gaz adapté, il faut connaître le métal et le procédé.</p><ul class="welding-checklist"><li>Relever la nuance sur le plan ou le document matière.</li><li>Demander le procédé indiqué dans le mode opératoire.</li><li>Préciser le fil ou métal d’apport et l’épaisseur.</li></ul><button class="welding-primary" data-welding-edit="${s.material==='unknown'?'material':'process'}">Compléter les informations ${icon('chevron')}</button><button class="welding-entry" data-welding-direct><span>Consulter un gaz connu</span>${icon('chevron')}</button>`;
  } else {
    const result=weldingSelectionForView();
    const pending=result.conditional.filter(m=>s.need==='courant'||m.needMatch),secondary=result.conditional.filter(m=>!pending.includes(m));
    const selected=product?weldingCurrentMatch(product.id):null;
    const only=result.focused.length===1?result.focused[0]:!result.focused.length&&pending.length===1?pending[0]:null;
    const active=selected||only;
    const warning=s.material==='inox'?'<p class="welding-notice">Nuance inox à préciser : ces usages ne suffisent pas à valider le gaz pour la pièce du client.</p>':'';
    if(active){
      content=warning+weldingProductDetail(active.product,active,{back:!!selected});
      const alternatives=result.focused.filter(m=>m.product.id!==active?.product.id),conditions=result.conditional.filter(m=>m.product.id!==active?.product.id);
      if(alternatives.length)content+=`<details class="welding-disclosure"><summary>Autres gaz correspondant à la recherche (${alternatives.length}) ${icon('chevron')}</summary>${weldingCards(alternatives)}</details>`;
      if(conditions.length)content+=`<details class="welding-disclosure"><summary>Autres pistes sous conditions (${conditions.length}) ${icon('chevron')}</summary><p class="welding-note">Les conditions et le besoin doivent être vérifiés pour chaque gaz.</p>${weldingCards(conditions)}</details>`;
    } else {
      content=`<h2 id="welding-question" tabindex="-1">${result.focused.length?`${result.focused.length} gaz à envisager`:pending.length?'Des conditions à confirmer':'Le besoin reste à préciser'}</h2>${warning}`;
      if(result.focused.length)content+=`<p class="welding-panel-intro">${s.need==='courant'?'Le métal et le procédé sont cités dans les usages publiés.':'L’objectif est cité dans les usages publiés.'} Ouvrez un gaz pour préparer votre réponse.</p>${weldingCards(result.focused)}<p class="welding-note">L’ordre d’affichage ne classe pas les performances. Le choix final dépend de l’application.</p>`;
      else content+=`<p class="welding-panel-intro">${result.needsClarification?'Aucune correspondance documentée pour cette combinaison. Faire préciser l’application avec un référent soudage.':'Aucun gaz ne peut être mis en avant pour cet objectif avec les informations confirmées.'}</p>`;
      if(pending.length)content+=`<h3 class="welding-list-label">À confirmer avec le client</h3>${weldingCards(pending)}`;
      if(secondary.length)content+=`<details class="welding-disclosure"><summary>Autres usages sous conditions (${secondary.length}) ${icon('chevron')}</summary><p class="welding-note">Le respect d’une condition ne prouve pas un gain pour l’objectif choisi.</p>${weldingCards(secondary)}</details>`;
    }
    const others=result.other.filter(m=>m.product.id!==active?.product.id);
    if(others.length)content+=`<details class="welding-disclosure"><summary>Autres usages publiés (${others.length}) ${icon('chevron')}</summary><p class="welding-note">Le métal et le procédé sont cités, mais l’objectif choisi ou la nuance précise ne sont pas détaillés pour ces gaz.</p>${weldingCards(others)}</details>`;
    if(s.declined?.length)content+=`<p class="welding-notice">Une condition a été déclarée non remplie. Les pistes concernées sont écartées de cette vue.</p><button class="welding-text" data-welding-review-conditions>Revoir ces réponses</button>`;
  }
  if(s.material&&weldingUI.mode==='guide'&&!weldingUI.panel){
    const need=weldingChoiceLabels[s.need]?.name||'';
    context=`<details class="welding-context"><summary><span>${esc(weldingContext()||'Informations à préciser')}${need?`<small>${esc(need)}</small>`:''}</span><span class="welding-context-edit">Modifier ${icon('chevron')}</span></summary><div><button data-welding-edit="material">Modifier le métal</button>${s.process?'<button data-welding-edit="process">Modifier le procédé</button>':''}${s.need&&s.need!=='unknown'?'<button data-welding-edit="need">Modifier le besoin</button>':''}</div></details>`;
  }
  $('#main').innerHTML=`<div class="welding-page welding-v205"><header class="welding-header"><div>${brand}<h1>Soudage</h1></div>${s.material||s.group||weldingUI.mode==='direct'?'<button class="welding-text welding-restart" data-welding-reset>Nouvelle demande</button>':''}${themeButton()}</header>${context}<section class="welding-guide">${content}</section><details class="welding-disclosure welding-limits"><summary>Sources et limites du conseil ${icon('chevron')}</summary><div><p>Présélection issue des fiches publiques Air Liquide France consultées le 21 octobre 2026. Les faits produit sont reliés à leur source. Les conseils d’entretien sont des propositions du guide.</p><p>Le choix final, les réglages et la sécurité nécessitent le mode opératoire validé et la FDS du produit livré. Aucun gain ni tarif n’est garanti.</p><p>Conseils disponibles hors ligne après mise en cache. Les documents externes nécessitent Internet. Guide indépendant, sans partenariat ni validation d’Air Liquide.</p></div></details></div>`;
  $('#welding-search')?.addEventListener('input',e=>{weldingUI.search=e.target.value;$('#welding-products').innerHTML=weldingDirectList();});
  nav('soudage');
}
function refreshWeldingGuide(){weldingGuide();syncTheme();window.scrollTo(0,0);$('#welding-question')?.focus({preventScroll:true});}
function ranges() {
  $('#main').innerHTML=`${intro('Gammes & mélanges','Les références commerciales, clairement.')}<p class="reading range-intro">${data.products.length} références documentées dans les gammes ARCAL™, ALIGAL™, ALPHAGAZ™ et LASAL™. D’autres gammes sont répertoriées avec un accès au catalogue fabricant. Cet inventaire reste partiel.</p><ul class="gas-list range-list">${data.ranges.map(r=>`<li><a class="gas-row" href="#gamme/${r.id}"><span class="gas-text"><strong>${esc(r.name)}</strong><span>${esc(r.description)}</span><small>${data.products.filter(g=>g.range===r.id).length ? data.products.filter(g=>g.range===r.id).length+' références documentées' : 'Compositions à documenter'}</small></span>${icon('chevron','chevron')}</a></li>`).join('')}</ul><p class="catalogue-note">Les marques appartiennent à leur titulaire. Guide indépendant, sans affiliation avec Air Liquide.</p>`;nav('gammes');
}
function rangeDetail(r) {
  const products=data.products.filter(g=>g.range===r.id);
  const list=r.id==='arcal'?['Référents','Techniques'].map(category=>`<section><h2>${category==='Référents'?'Les 4 Référents':'Les 17 Techniques'}</h2><p class="list-caption">${category==='Référents'?'Prime, Chrome, Speed et Force : les principaux repères de la gamme.':'Des mélanges pour des matériaux et procédés précis.'}</p><ul class="gas-list">${gasRows(products.filter(g=>g.welding?.category===category))}</ul></section>`).join(''):`<ul class="gas-list">${gasRows(products)}</ul>`;
  $('#main').innerHTML=`<div class="topbar detail-bar"><a href="#gammes" class="back">${icon('back')}Gammes</a>${themeButton()}</div><header class="page-title"><h1 tabindex="-1">${esc(r.name)}</h1><p>${esc(r.description)}</p></header><p class="section-caption">${products.length} référence(s) documentée(s) · Catalogue France · 21 octobre 2026</p>${list}${products.length?'':'<p class="reading">Les compositions de cette gamme ne sont pas encore documentées dans cette édition.</p>'}<a class="document-action" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${icon('external')}<span>Consulter le catalogue officiel<small>Source externe · connexion nécessaire</small></span></a><p class="catalogue-note">${r.id==='arcal'?'Les 21 produits des deux pages ARCAL France consultées sont documentés.':'Liste partielle.'} Les formats, grades et mélanges sur mesure peuvent varier ; la disponibilité reste à confirmer.</p>`;nav('gammes');
}
const sheetTabs=[['essential','Essentiel'],['safety','Sécurité'],['transport','Transport'],['technical','Technique']];
function selectSheetTab(key) {
  if(!sheetTabs.some(([id])=>id===key))return;
  document.querySelectorAll('[role=tab][data-sheet-tab]').forEach(tab=>{const active=tab.dataset.sheetTab===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
  document.querySelectorAll('[role=tabpanel][data-panel]').forEach(panel=>panel.hidden=panel.dataset.panel!==key);
}
const ficheStateSelection=new Map();
function sourcesDisclosure(g) {
  return `<details class="fiche-sources"><summary><span><strong>Sources et limites</strong></span>${icon('chevron')}</summary><ul class="sources">${sourceLinks(g.sources)}</ul>${g.consultation&&g.welding?`<div class="manufacturer-use-notes"><h3>Précisions du fabricant</h3>${g.welding.uses.map(u=>`<p class="footnote"><strong>${esc(u.title)}</strong> · ${esc(u.detail)}</p>`).join('')}${g.welding.benefits.map(b=>`<p class="footnote">${esc(b)}</p>`).join('')}</div>`:''}<p class="footnote">Date et périmètre de consultation propres à chaque source. La FDS du produit livré et les consignes du site restent indispensables. Les documents externes ne sont pas enregistrés hors ligne.</p><p class="footnote">${g.kind==='product'?'Composition et conditionnements selon la référence publiée.':'Valeurs de la substance de référence, pas d’une bouteille donnée.'} L’étiquette identifie le contenu ; la teinte de l’ogive est indicative.</p></details>`;
}
function detail(g) {
  $('#main').innerHTML=ficheMarkup(g,{stateId:ficheStateSelection.get(g.id),favorite:bookmark(g),sources:sourcesDisclosure(g),back:'#catalogue',backLabel:'Catalogue'});
  nav('catalogue');
}

let glossaryState={query:'',group:'all'};
let converterState={entryId:null,choosing:true,search:'',category:'gas',phase:'gaz',from:'kg',to:'m³',value:'',direction:'liquide-gaz'};
function toolsFrame(title,subtitle,content){return `<div class="tools-page"><header class="tools-header"><div>${brand}<h1 tabindex="-1">${title}</h1></div>${themeButton()}</header><p class="tools-subtitle">${subtitle}</p>${content}</div>`;}
function reperes(){
  $('#main').innerHTML=toolsFrame('Outils','Comprendre les gaz et convertir vos unités.',toolsHomeMarkup());nav('reperes');
}
function glossary(){
  $('#main').innerHTML=toolsFrame('Glossaire','Les mots utiles, simplement.',glossaryMarkup(glossaryState.query,glossaryState.group));nav('reperes');
  $('#glossary-search').addEventListener('input',e=>{glossaryState.query=e.target.value;$('#glossary-results').innerHTML=glossaryListMarkup(glossaryState.query,glossaryState.group);});
}
function converter(){
  $('#main').innerHTML=toolsFrame('Convertir','Un gaz, des conditions, un résultat.',converterMarkup(allEntries(),converterState));nav('reperes');
  $('#converter-search')?.addEventListener('input',e=>{converterState.search=e.target.value;$('#converter-gas-results').innerHTML=converterGasListMarkup(allEntries(),converterState.search);});
  $('#conversion-value')?.addEventListener('input',e=>{converterState.value=e.target.value;$('#conversion-output').innerHTML=converterOutputMarkup(allEntries().find(g=>g.id===converterState.entryId),converterState);});
  const controls={'conversion-category':'category','conversion-phase':'phase','conversion-direction':'direction','conversion-from':'from','conversion-to':'to'};
  for(const [id,key] of Object.entries(controls))$('#'+id)?.addEventListener('change',e=>{
    converterState[key]=e.target.value;
    if(key==='category'){Object.assign(converterState,CONVERTER_DEFAULTS[converterState.category]);converterState.value='';}
    if(key==='phase'||key==='direction')converterState.value='';
    converter();syncTheme();$('#'+id)?.focus({preventScroll:true});
  });
}
function refreshConverter(){converter();syncTheme();window.scrollTo(0,0);$('.tools-page h1')?.focus({preventScroll:true});}
function guideAbout() {
  $('#main').innerHTML=`${intro('À propos du guide','Sources, fonctionnement et préférences.')}<a class="tools-back" href="#reperes">${icon('back')}Outils</a><section><h2>Un guide indépendant</h2><div class="reading"><p>${data.gases.length} fiches couvrant toutes les entrées de l’<a href="https://encyclopedia.airliquide.com/fr" target="_blank" rel="noopener noreferrer">encyclopédie publique Air Liquide</a> consultée le 21 octobre 2026. S’y ajoutent ${data.products.length} références commerciales documentées, accessibles dans <a href="#gammes">Gammes</a>. Le catalogue commercial est partiel. Ce périmètre comprend aussi l’air, des liquides, des isomères et des formes de l’hydrogène. Il ne représente pas tous les mélanges ou grades commercialisés.</p><p>Air Liquide est cité comme source. Cette application n’est ni éditée, ni approuvée, ni sponsorisée par Air Liquide. Aucun logo ou visuel de cette entreprise n’est utilisé.</p><p>La FDS à jour du produit livré et les consignes de votre site restent indispensables avant une intervention. Ce guide n’est pas un outil de dimensionnement ou une procédure d’urgence.</p></div></section><section><h2>Les unités, sans ambiguïté</h2><div class="reading"><p><strong>kg/m³</strong> : masse volumique. Les valeurs gazeuses retenues se rapportent à <strong>15 °C et 1,013 bar absolu</strong>. Pour l’azote et l’oxygène liquides, la température d’ébullition et la pression sont précisées séparément. Ces valeurs ne donnent pas la masse volumique du gaz comprimé dans une bouteille.</p><p><strong>g/mol</strong> : masse d’une mole de la substance ; valeur de référence indépendante de la phase dans cette fiche.</p><p><strong>°C</strong> : transition de phase à 1,013 bar absolu. CO₂ et C₂H₂ : sublimation. L’air est un mélange. Les transitions manquantes ou assorties d’une autre référence sont expliquées dans la fiche.</p><p>Les valeurs sont transcrites des tableaux des sources, sans extrapolation. Une valeur absente, ambiguë ou incohérente est signalée, jamais remplacée par zéro. Certaines substances disposent d’un nombre limité d’utilisations vérifiées. Les usages historiques des réfrigérants et halons ne valent pas autorisation actuelle d’emploi. La précision publiée n’est pas une garantie d’incertitude de mesure.</p></div></section><section><h2>Formule, symbole, abréviation</h2><div class="reading"><p><strong>O₂, N₂, H₂</strong> sont des molécules ; <strong>O, N, H</strong> sont des symboles d’éléments. <strong>Ar, He, Ne</strong> désignent des gaz monoatomiques.</p><p><strong>CO ≠ Co</strong> : monoxyde de carbone et cobalt. Les majuscules comptent dans une formule.</p><p><strong>LOX, LIN, LAR</strong> désignent respectivement l’oxygène, l’azote et l’argon liquides. La recherche accepte ces abréviations. Vérifiez l’état sélectionné et les conditions de la donnée dans la fiche ou le convertisseur.</p><p><a href="https://my.airliquide.com/products-services/our-supply-modes" target="_blank" rel="noopener noreferrer">Source des abréviations : Air Liquide</a></p></div></section><section><h2>Sur votre iPhone</h2><div class="reading"><ol><li>Ouvrez ce site dans Safari.</li><li>Dans le menu de partage, choisissez l’ajout à l’écran d’accueil (le libellé peut varier selon iOS).</li><li>Avant de quitter le réseau, attendez la mention « Hors ligne disponible ».</li></ol><p>Les ${allEntries().length} fiches, la recherche et les favoris sont alors consultables sans réseau. Les sites sources ne sont pas enregistrés. Une première visite hors ligne ne peut pas installer l’application.</p><p>iOS peut supprimer les données locales pour libérer de l’espace. Les favoris ne sont pas synchronisés entre appareils et peuvent être distincts entre Safari et l’application installée.</p></div></section><section><h2>Apparence</h2><div class="setting"><label for="theme-select">Thème</label><select id="theme-select"><option value="system">Automatique</option><option value="light">Clair</option><option value="dark">Sombre</option></select></div></section><section><h2>Données & confidentialité</h2><div class="reading"><p>Édition ${data.version} · Propriétés du catalogue : sources du 21 octobre 2026 ; enrichissement des utilisations, glossaire et unités : 22 octobre 2026. Pas de mise à jour automatique des propriétés depuis les sites sources. Une nouvelle édition du guide est proposée lorsqu’elle est publiée.</p><p>Aucun compte, aucune publicité et aucun outil de suivi ajouté par l’application. Favoris et thème sont enregistrés localement. L’hébergement GitHub Pages et les sources externes peuvent traiter des données de connexion selon leurs propres politiques.</p><p><a href="https://github.com/Bidibulle50/guide-des-gaz" target="_blank" rel="noopener noreferrer">Consulter le code et la documentation</a></p></div></section>`;
  $('#theme-select').addEventListener('change',e=>applyTheme(e.target.value));nav('reperes');
}
let lastRoute='';
function render() {
  const route=location.hash || '#catalogue';
  if(lastRoute==='#catalogue') catalogueScroll=window.scrollY;
  if(route.startsWith('#gaz/')) {
    const g=allEntries().find(g=>g.id===route.slice(5)||g.legacyIds?.includes(route.slice(5)));
    if(g) {detail(g);document.title=`${g.name} · Guide des gaz`;}
    else {$('#main').innerHTML=`${intro('Fiche introuvable','Ce gaz ne figure pas dans cette édition.')}<a class="text-button" href="#catalogue">Ouvrir le catalogue</a>`;nav('catalogue');}
  } else if(route==='#soudage') {weldingGuide();document.title='Soudage · Guide des gaz';}
  else if(route==='#gammes') {ranges();document.title='Gammes · Guide des gaz';}
  else if(route.startsWith('#gamme/')) {const r=data.ranges.find(r=>r.id===route.slice(7));if(r)rangeDetail(r);else ranges();document.title=(r?.name||'Gammes')+' · Guide des gaz';}
  else if(route==='#glossaire') {glossary();document.title='Glossaire · Guide des gaz';}
  else if(route==='#convertisseur') {converter();document.title='Convertir · Guide des gaz';}
  else if(route==='#guide') {guideAbout();document.title='À propos · Guide des gaz';}
  else if(route==='#reperes'||route==='#outils') {reperes();document.title='Outils · Guide des gaz';}
  else {catalogue();document.title='Guide des gaz';}
  syncTheme();
  if(lastRoute) (route==='#catalogue'?$(catalogueOverview&&!query.trim()?'#catalogue-home-heading':'#catalogue-heading'):$('h1'))?.focus({preventScroll:true});
  window.scrollTo(0,route==='#catalogue'?catalogueScroll:0);lastRoute=route;
}
document.addEventListener('click', e=> {
  const t=e.target.closest('button,a');if(!t)return;
  if(t.dataset.glossaryGroup){glossaryState.group=t.dataset.glossaryGroup;glossary();syncTheme();document.querySelector(`[data-glossary-group="${glossaryState.group}"]`)?.focus({preventScroll:true});}
  if(t.hasAttribute('data-glossary-clear')){glossaryState.query='';$('#glossary-search').value='';$('#glossary-results').innerHTML=glossaryListMarkup('',glossaryState.group);$('#glossary-search').focus();}
  if(t.dataset.converterEntry&&allEntries().some(g=>g.id===t.dataset.converterEntry)){Object.assign(converterState,{entryId:t.dataset.converterEntry,choosing:false,phase:'gaz',value:''});refreshConverter();}
  if(t.hasAttribute('data-converter-reselect')){converterState.choosing=true;converterState.search='';refreshConverter();$('#converter-search')?.focus();}
  if(t.hasAttribute('data-converter-cancel')){converterState.choosing=false;refreshConverter();}
  if(t.hasAttribute('data-converter-clear-search')){converterState.search='';$('#converter-search').value='';$('#converter-gas-results').innerHTML=converterGasListMarkup(allEntries());$('#converter-search').focus();}
  if(t.hasAttribute('data-converter-sign')&&['temperature','pressure'].includes(converterState.category)){const raw=converterState.value.trim();if(raw){converterState.value=raw.startsWith('-')?raw.slice(1):'-'+raw.replace(/^\+/,'');$('#conversion-value').value=converterState.value;$('#conversion-output').innerHTML=converterOutputMarkup(allEntries().find(g=>g.id===converterState.entryId),converterState);}$('#conversion-value')?.focus({preventScroll:true});}
  if(t.hasAttribute('data-converter-swap')){[converterState.from,converterState.to]=[converterState.to,converterState.from];converter();syncTheme();$('[data-converter-swap]')?.focus({preventScroll:true});}
  if(t.dataset.weldingGroup){const group=weldingMaterialGroups.find(g=>g.id===t.dataset.weldingGroup);if(group){weldingJourney={group:group.id,material:group.materials.length===1?group.materials[0]:null,process:null,need:null,confirmed:[],declined:[]};weldingUI.selected=null;weldingUI.panel=null;refreshWeldingGuide();}}
  if(t.dataset.weldingField){const field=t.dataset.weldingField;if(['material','process','need'].includes(field)){weldingJourney[field]=t.dataset.value;if(field==='material'){weldingJourney.process=null;weldingJourney.need=null;}if(field==='process')weldingJourney.need=null;weldingJourney.confirmed=[];weldingJourney.declined=[];weldingUI.selected=null;weldingUI.panel=null;refreshWeldingGuide();}}
  if(t.hasAttribute('data-welding-reset')){weldingJourney={group:null,material:null,process:null,need:null,confirmed:[],declined:[]};weldingUI={mode:'guide',selected:null,panel:null,search:''};refreshWeldingGuide();}
  if(t.dataset.weldingEdit){const field=t.dataset.weldingEdit;weldingJourney[field]=null;if(field==='material'){weldingJourney.group=null;weldingJourney.process=null;}if(field!=='need')weldingJourney.need=null;weldingJourney.confirmed=[];weldingJourney.declined=[];weldingUI.selected=null;weldingUI.panel=null;refreshWeldingGuide();}
  if(t.dataset.weldingConfirm){weldingJourney.confirmed=[...new Set([...weldingJourney.confirmed,t.dataset.weldingConfirm])];weldingJourney.declined=(weldingJourney.declined||[]).filter(k=>k!==t.dataset.weldingConfirm);weldingUI.panel=null;refreshWeldingGuide();}
  if(t.dataset.weldingDecline){weldingJourney.declined=[...new Set([...(weldingJourney.declined||[]),t.dataset.weldingDecline])];weldingUI.selected=null;weldingUI.panel=null;refreshWeldingGuide();}
  if(t.dataset.weldingUnconfirm){const key=t.dataset.weldingUnconfirm;weldingJourney.confirmed=weldingJourney.confirmed.filter(k=>k!==key);if(key==='automatique'&&weldingJourney.need==='automatique')weldingJourney.need=null;weldingUI.selected=null;weldingUI.panel=null;refreshWeldingGuide();}
  if(t.hasAttribute('data-welding-review-conditions')){weldingJourney.declined=[];refreshWeldingGuide();}
  if(t.hasAttribute('data-welding-unknown')){if(!weldingJourney.material)weldingJourney.material='unknown';weldingJourney.process='unknown';weldingJourney.need='unknown';weldingUI.selected=null;weldingUI.panel=null;refreshWeldingGuide();}
  if(t.hasAttribute('data-welding-direct')){weldingUI={mode:'direct',selected:null,panel:null,search:''};refreshWeldingGuide();$('#welding-search')?.focus({preventScroll:true});}
  if(t.hasAttribute('data-welding-guided')){weldingUI={mode:'guide',selected:null,panel:null,search:''};refreshWeldingGuide();}
  if(t.dataset.weldingProduct){weldingUI.selected=t.dataset.weldingProduct;weldingUI.panel=null;refreshWeldingGuide();}
  if(t.hasAttribute('data-welding-results')){weldingUI.selected=null;weldingUI.panel=null;refreshWeldingGuide();}
  if(t.dataset.weldingPanel){weldingUI.selected=t.dataset.product;weldingUI.panel=t.dataset.weldingPanel;refreshWeldingGuide();}
  if(t.hasAttribute('data-welding-close-panel')){weldingUI.panel=null;refreshWeldingGuide();}
  if(t.hasAttribute('data-welding-clear-search')){weldingUI.search='';$('#welding-search').value='';$('#welding-products').innerHTML=weldingDirectList();$('#welding-search').focus();}
  if(t.hasAttribute('data-fiche-state')){
    const article=t.closest('[data-entry]'),g=allEntries().find(g=>g.id===article?.dataset.entry);
    if(g&&sheetStates(g).some(s=>s.id===t.dataset.ficheState)){
      const tab=$('[data-sheet-tab][aria-selected="true"]')?.dataset.sheetTab||'essential';
      ficheStateSelection.set(g.id,t.dataset.ficheState);detail(g);selectSheetTab(tab);
      document.querySelectorAll('[data-fiche-state]').forEach(b=>{if(b.dataset.ficheState===t.dataset.ficheState)b.focus({preventScroll:true});});
    }
  }
  if(t.dataset.sheetTab) selectSheetTab(t.dataset.sheetTab);
  if(t.dataset.jump){const target=document.getElementById(t.dataset.jump);const panel=target?.closest('[role=tabpanel]');if(panel)selectSheetTab(panel.dataset.panel);if(target){target.tabIndex=-1;target.scrollIntoView({block:'start',behavior:'instant'});target.focus({preventScroll:true});}}
  if(t.matches('[data-theme-cycle]')) {const options=['system','light','dark'];applyTheme(options[(options.indexOf(theme())+1)%3]);toast(`Thème : ${themeNames[theme()]}`);}
  if(t.hasAttribute('data-home')) {catalogueRisk='all';catalogueOverview=true;catalogueScroll=0;mode='essentials';query='';if(location.hash==='#catalogue'||!location.hash){catalogue();syncTheme();window.scrollTo(0,0);}}
  if(t.dataset.mode) {catalogueRisk='all';catalogueOverview=false;mode=t.dataset.mode;query='';$('#search').value='';document.querySelectorAll('.segmented [data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));renderList();window.scrollTo(0,0);}
  if(t.hasAttribute('data-clear')) {query='';$('#search').value='';renderList();$('#search').focus();}
  if(t.dataset.favorite) {
    const id=t.dataset.favorite;favorites.has(id)?favorites.delete(id):favorites.add(id);
    let saved=true;try {localStorage.setItem('guide-gaz-favorites',JSON.stringify([...favorites]));}catch{saved=false;}
    const g=allEntries().find(g=>g.id===id);t.outerHTML=bookmark(g);$('[data-favorite]')?.focus({preventScroll:true});toast(saved?(favorites.has(id)?'Ajouté aux favoris':'Retiré des favoris'):'Favori conservé pour cette session seulement.');
  }
});
document.addEventListener('keydown',e=>{
  const tab=e.target.closest('[role=tab][data-sheet-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  const tabs=[...tab.closest('[role=tablist]').querySelectorAll('[role=tab]')],i=tabs.indexOf(tab);
  const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  e.preventDefault();selectSheetTab(tabs[next].dataset.sheetTab);tabs[next].focus({preventScroll:true});
});
window.addEventListener('hashchange',()=>{if(data)render();});
window.addEventListener('storage',e=>{if(!data)return;if(e.key==='guide-gaz-favorites'){favorites=readFavorites(e.newValue,new Set(allEntries().map(g=>g.id)));render();}if(e.key==='guide-gaz-theme'){document.documentElement.dataset.theme=['system','light','dark'].includes(e.newValue)?e.newValue:'system';syncTheme();}});
function connection() { $('#connection').innerHTML=offlineReady?`${icon('check')} ${navigator.onLine?'Hors ligne disponible':'Hors connexion · fiches disponibles'}`:navigator.onLine?'Mode hors ligne en préparation…':'Hors connexion · cache non confirmé'; }
window.addEventListener('online',connection);window.addEventListener('offline',connection);
async function checkOffline() {
  const controller=navigator.serviceWorker?.controller;if(!controller)return;
  const channel=new MessageChannel();channel.port1.onmessage=e=>{offlineReady=e.data?.ready===true;connection();channel.port1.close();};controller.postMessage({type:'CACHE_STATUS'},[channel.port2]);
}
async function setupOffline() {
  if(!('serviceWorker' in navigator)){ $('#connection').textContent='Mode hors ligne non pris en charge par ce navigateur.';return; }
  try {
    const registration=await navigator.serviceWorker.register('./sw.js');
    function offerUpdate(){if(registration.waiting&&navigator.serviceWorker.controller){waitingWorker=registration.waiting;$('#update').hidden=false;}}
    offerUpdate();registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'){offerUpdate();checkOffline();}if(worker.state==='redundant'&&!navigator.serviceWorker.controller){$('#connection').textContent='Enregistrement hors ligne échoué. Rechargez avec une connexion.';}});});
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(window.guideUpdateRequested)location.reload();else checkOffline();});
    await navigator.serviceWorker.ready;await checkOffline();
    $('#apply-update').addEventListener('click',()=>{if(waitingWorker){window.guideUpdateRequested=true;waitingWorker.postMessage({type:'SKIP_WAITING'});}});
  } catch {$('#connection').textContent='Mode hors ligne indisponible. Rechargez avec une connexion.';}
}
async function start() {
  try {const response=await fetch('./data/gases.json');if(!response.ok)throw new Error();data=await response.json();try{favorites=readFavorites(localStorage.getItem('guide-gaz-favorites'),new Set(allEntries().map(g=>g.id)));}catch{}render();setupOffline();}
  catch {$('#main').innerHTML=`${intro('Guide indisponible','Les fiches n’ont pas pu être chargées.')}<p>Rétablissez votre connexion, puis rechargez le guide.</p><button class="text-button" id="retry">Réessayer</button>`;$('#retry').onclick=()=>location.reload();$('#connection').textContent='Les fiches ne sont pas disponibles hors ligne.';syncTheme();}
}
start();
