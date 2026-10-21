import { iconMarkup } from './ui-icons.js';
import { ESSENTIAL_IDS, catalogueSelection, readFavorites, escapeHtml as esc } from './core.js';
import { MATERIALS, PROCESSES, NEEDS, availableProcesses, weldingSelection } from './welding.js';
const $ = s => document.querySelector(s);
const icon = (key, cls='') => (iconMarkup[key] || '').replace('<svg ', `<svg aria-hidden="true" focusable="false" class="icon ${cls}" `);
const brand = '<img class="brand" src="./icons/brand-cobalt-128.png" alt="" width="48" height="48">';
const allEntries = () => [...data.gases, ...(data.products || [])];
let data, favorites = new Set(), query = '', mode = 'essentials', catalogueScroll = 0, catalogueOverview = true, toastTimer, offlineReady = false, waitingWorker;
let weldingJourney={material:null,process:null,need:null,confirmed:[]};
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
function nav(active) { $('.bottom-nav').innerHTML = `<a href="#catalogue" data-home ${active==='catalogue'?'aria-current="page"':''}><span class="nav-art nav-art-catalogue" aria-hidden="true"></span><span>Catalogue</span></a><a href="#soudage" ${active==='soudage'?'aria-current="page"':''}><span class="nav-art nav-art-welding" aria-hidden="true"></span><span>Soudage</span></a><a href="#gammes" ${active==='gammes'?'aria-current="page"':''}><span class="nav-art nav-art-ranges" aria-hidden="true"></span><span>Gammes</span></a><a href="#reperes" ${active==='reperes'?'aria-current="page"':''}><span class="nav-art nav-art-references" aria-hidden="true"></span><span>Repères</span></a>`; }
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

function sourceLinks(sources) { return sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${icon('external')}<span><strong>${esc(s.title)}</strong><small>${esc(s.scope)}</small></span>${icon('chevron','chevron')}</a></li>`).join(''); }
const selectionName=(options,id)=>options.find(x=>x.id===id)?.name||'';
function weldingChoice(options,field){
  return `<ul class="choice-list">${options.map(o=>`<li><button data-welding-field="${field}" data-value="${esc(o.id)}"><span><strong>${esc(o.name)}</strong><small>${esc(o.detail)}</small></span>${icon('chevron','chevron')}</button></li>`).join('')}</ul>`;
}
function weldingCards(matches){
  const confirmations={'automatique':'Le client confirme le mode automatique','fil-plein':'Le client confirme le fil plein','pulse-fil-plein':'Le client confirme : MAG pulsé et fil plein','fil-fourre-inox':'Le client confirme le fil fourré inox'};
  return matches.map(m=>`<article class="welding-result"><div class="welding-result-heading"><h3>${esc(m.product.name)}</h3><span>${esc(m.product.welding.category==='Référents'?'Référent':'Technique')}</span></div><p>${esc(m.why)}</p>${m.needMatch?'<p class="need-evidence">Le besoin choisi est mentionné dans la source.</p>':''}${m.condition?`<div class="condition-note"><strong>À préciser avec le client</strong><p>${esc(m.condition.text)}</p>${confirmations[m.condition.key]?`<button class="text-button" data-welding-confirm="${esc(m.condition.key)}">${esc(confirmations[m.condition.key])}</button>`:''}</div>`:''}${m.confirmedCondition?`<p class="footnote">Information client retenue : ${esc(m.confirmedCondition.text)}</p>`:''}${m.product.welding.safety.classificationCode==='1F'?'<p class="welding-risk">Produit déclaré extrêmement inflammable · voir sa FDS.</p>':''}<div class="result-links"><a href="#gaz/${esc(m.product.id)}">Fiche, formats & FDS ${icon('chevron','chevron')}</a><a href="${esc(m.product.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source Air Liquide ${icon('external')}</a></div></article>`).join('');
}
function weldingGuide(){
  const s=weldingJourney,step=!s.material?1:!s.process?2:!s.need?3:4;
  const material=selectionName(MATERIALS,s.material),process=selectionName(PROCESSES,s.process),need=selectionName(NEEDS,s.need);
  let content='';
  if(step===1)content=`<h2 id="welding-question" tabindex="-1">Quel matériau veut souder le client ?</h2>${weldingChoice(MATERIALS,'material')}<button class="quiet-action" data-welding-unknown>Le matériau n’est pas encore connu ${icon('chevron')}</button>`;
  else if(step===2)content=`<h2 id="welding-question" tabindex="-1">Avec quel procédé ?</h2><p class="list-caption">Les procédés ci-dessous sont ceux documentés pour ce matériau.</p>${weldingChoice(availableProcesses(s.material),'process')}<button class="quiet-action" data-welding-unknown>Le procédé reste à préciser ${icon('chevron')}</button>`;
  else if(step===3)content=`<h2 id="welding-question" tabindex="-1">Quel est son besoin principal ?</h2><p class="list-caption">Un besoin sans détail publié sera signalé dans les résultats.</p>${weldingChoice(NEEDS,'need')}`;
  else if(s.process==='unknown'||s.material==='unknown')content=`<h2 id="welding-question" tabindex="-1">Précisons la demande</h2><div class="reading"><p>Le matériau et le procédé sont nécessaires pour établir une présélection documentée.</p><ul class="client-questions"><li>Quelle nuance ou référence matière ?</li><li>Quel poste et quel procédé le client utilise-t-il ?</li><li>Quel fil, quelle épaisseur et quelle position de soudage ?</li><li>Travail manuel, automatique ou robotisé ?</li></ul><p><a href="#gamme/arcal">Consulter les 21 fiches ARCAL</a></p></div>`;
  else {
    const result=weldingSelection(data.products,s),total=result.focused.length+result.other.length+result.conditional.length;
    content=`<h2 id="welding-question" tabindex="-1">Les pistes ARCAL</h2><p class="list-caption">${total} fiche(s) avec un domaine publié pour ce matériau et ce procédé. Les produits ayant un usage explicitement ciblé sont présentés avant les usages généraux.</p>${s.material==='inox'?'<p class="guide-callout">La nuance inox reste à identifier. Les produits spécifiques aux inox austénitiques ou Duplex ne sont pas proposés sur ce seul libellé.</p>':''}${result.needsClarification?'<p class="guide-callout">Aucune correspondance documentée dans cette édition. Faire préciser l’application avec un technicien soudage.</p>':''}${result.focused.length?`<section><h3 class="results-label">${s.need==='courant'?'Usages documentés':'Besoin mentionné par le fabricant'}</h3>${weldingCards(result.focused)}</section>`:s.need!=='courant'&&!result.needsClarification?'<p class="guide-callout">Les fiches consultées ne permettent pas encore de retenir un produit pour ce besoin sans précision supplémentaire. Examinez les usages et conditions ci-dessous.</p>':''}${result.conditional.length?`<section><h3 class="results-label">Conditions à préciser</h3>${weldingCards(result.conditional)}</section>`:''}${result.other.length?`<section><h3 class="results-label">Autres usages publiés à examiner</h3><p class="list-caption">Le domaine matériau/procédé est cité. Le besoin choisi ou la nuance précise n’est pas détaillé pour tous ces produits.</p>${weldingCards(result.other)}</section>`:''}<details class="technical-details"><summary>Questions à poser avant la proposition</summary><ul class="client-questions"><li>Nuance exacte et état de surface ; épaisseur et préparation.</li><li>Procédé, régime, métal d’apport et position.</li><li>Objectif de qualité, corrosion, cadence ou finition.</li><li>Consommation, mobilité et conditionnement souhaité.</li><li>Validation du mode opératoire de soudage avec le référent technique.</li></ul></details><button class="quiet-action" data-welding-edit="need">Modifier le besoin et les informations client ${icon('chevron')}</button>`;
  }
  const summary=s.material?`<div class="journey-summary"><button data-welding-edit="material">${esc(material||'Matériau à préciser')}</button>${s.process?`<button data-welding-edit="process">${esc(process||'Procédé à préciser')}</button>`:''}${s.need&&s.need!=='unknown'?`<span>${esc(need)}</span>`:''}</div>`:'';
  $('#main').innerHTML=`${intro('Soudage','Préparer la réponse au client avec ARCAL.')}<div class="journey-progress"><p>${step<4?`Étape ${step} sur 3`:'Votre présélection'}</p>${s.material?'<button class="reset-journey" data-welding-reset>Nouvelle demande</button>':''}</div>${summary}<section class="welding-guide">${content}</section><p class="footnote guide-limit">Aide à la présélection fondée sur les fiches publiques Air Liquide France consultées le 21 octobre 2026. Les résultats explicitent les usages et les conditions publiés. Le choix final et les réglages nécessitent la validation du mode opératoire et la FDS du produit livré.</p><a class="home-link" href="#gamme/arcal">Toute la gamme ARCAL ${icon('chevron')}</a><p class="catalogue-note">Guide indépendant · Aucun partenariat ni validation d’Air Liquide.</p>`;
  nav('soudage');
}
function refreshWeldingGuide(){weldingGuide();syncTheme();window.scrollTo(0,0);$('#welding-question')?.focus({preventScroll:true});}
function documents(g) {
  if(!g.fds)return '';
  return `<section id="product-documents"><h2>Identification & FDS</h2><a class="document-action" href="${esc(g.fds.url)}" target="_blank" rel="noopener noreferrer">${icon('external')}<span>${esc(g.fds.label)}<small>${g.fds.kind==='individual'?'Document individuel · connexion nécessaire':g.fds.kind==='manufacturer_link'?'Lien fabricant · révision à vérifier':'Portail fournisseur · sélection du produit nécessaire'}</small></span></a><p class="footnote">${esc(g.fds.note)}</p><dl class="identifiers"><div><dt>Numéro ONU</dt><dd>${g.transport?.length?g.transport.map(t=>`<strong>UN ${esc(t.number)}</strong><small>${esc(t.state)}</small>`).join(''):'<small>Non vérifié pour ce produit. Consulter la rubrique 14 de sa FDS.</small>'}</dd></div><div><dt>Couleur d’ogive</dt><dd>${g.shoulder?`<span class="colour-swatch ral-${esc(g.shoulder.ral)}" aria-hidden="true"></span><strong>${esc(g.shoulder.name)} · RAL ${esc(g.shoulder.ral)}</strong><small><a href="${esc(g.shoulder.sourceUrl)}" target="_blank" rel="noopener noreferrer">Référence fabricant</a></small>`:'<small>Non documentée pour ce produit.</small>'}</dd></div></dl><p class="footnote">La couleur concerne l’ogive de la bouteille, selon le produit et le référentiel applicable (EN 1089-3 en Europe, GPL exclus). La marque n’a pas une couleur unique. L’étiquette identifie le contenu ; la teinte à l’écran reste indicative. Les références ONU ne remplacent pas les documents de transport du produit livré.</p></section>`;
}
function ranges() {
  $('#main').innerHTML=`${intro('Gammes & mélanges','Les références commerciales, clairement.')}<p class="reading range-intro">${data.products.length} références documentées dans les gammes ARCAL™, ALIGAL™, ALPHAGAZ™ et LASAL™. D’autres gammes sont répertoriées avec un accès au catalogue fabricant. Cet inventaire reste partiel.</p><ul class="gas-list range-list">${data.ranges.map(r=>`<li><a class="gas-row" href="#gamme/${r.id}"><span class="gas-text"><strong>${esc(r.name)}</strong><span>${esc(r.description)}</span><small>${data.products.filter(g=>g.range===r.id).length ? data.products.filter(g=>g.range===r.id).length+' références documentées' : 'Compositions à documenter'}</small></span>${icon('chevron','chevron')}</a></li>`).join('')}</ul><p class="catalogue-note">Les marques appartiennent à leur titulaire. Guide indépendant, sans affiliation avec Air Liquide.</p>`;nav('gammes');
}
function rangeDetail(r) {
  const products=data.products.filter(g=>g.range===r.id);
  const list=r.id==='arcal'?['Référents','Techniques'].map(category=>`<section><h2>${category==='Référents'?'Les 4 Référents':'Les 17 Techniques'}</h2><p class="list-caption">${category==='Référents'?'Prime, Chrome, Speed et Force : les principaux repères de la gamme.':'Des mélanges pour des matériaux et procédés précis.'}</p><ul class="gas-list">${gasRows(products.filter(g=>g.welding?.category===category))}</ul></section>`).join(''):`<ul class="gas-list">${gasRows(products)}</ul>`;
  $('#main').innerHTML=`<div class="topbar detail-bar"><a href="#gammes" class="back">${icon('back')}Gammes</a>${themeButton()}</div><header class="page-title"><h1 tabindex="-1">${esc(r.name)}</h1><p>${esc(r.description)}</p></header><p class="section-caption">${products.length} référence(s) documentée(s) · Catalogue France · 21 octobre 2026</p>${list}${products.length?'':'<p class="reading">Les compositions de cette gamme ne sont pas encore documentées dans cette édition.</p>'}<a class="document-action" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${icon('external')}<span>Consulter le catalogue officiel<small>Source externe · connexion nécessaire</small></span></a><p class="catalogue-note">${r.id==='arcal'?'Les 21 produits des deux pages ARCAL France consultées sont documentés.':'Liste partielle.'} Les formats, grades et mélanges sur mesure peuvent varier ; la disponibilité reste à confirmer.</p>`;nav('gammes');
}
function weldingDetail(g) {
  const w=g.welding,sheet=w.sheet;
  const source=`<a href="${esc(sheet.url)}" target="_blank" rel="noopener noreferrer">Fiche fabricant V${esc(sheet.version)} · ${esc(sheet.date)}</a>`;
  return {
    overview: `<dl class="product-overview"><div><dt>Procédés</dt><dd>${esc(w.processes.join(' · '))}</dd></div><div><dt>Matériaux / applications</dt><dd>${esc(w.materials.join(' · '))}</dd></div></dl>`,
    uses: `<section id="product-uses"><h2>Utilisations en détail</h2><ul class="use-cases">${w.uses.map(u=>`<li><h3>${esc(u.title)}</h3><p>${esc(u.detail)}</p></li>`).join('')}</ul>${w.benefits.length?`<p class="vendor-benefits">${esc(w.benefits.join(' '))}</p>`:''}<p class="footnote">Synthèse de la <a href="${esc(g.sourceUrl)}" target="_blank" rel="noopener noreferrer">page produit Air Liquide</a>. Les bénéfices annoncés par le fabricant dépendent de l’application et de ses paramètres.</p></section>`,
    technical: `<section id="product-supply"><h2>Formats, pression & chapeau</h2><p class="section-caption">${w.variants.length} référence(s) publiée(s) · tableau p. ${sheet.tablePage}</p><ul class="supply-list">${w.variants.map(v=>`<li><div class="supply-heading"><h3>${esc(v.mode)}${v.size?' · '+esc(v.size):''}</h3><span class="pressure">${v.pressure?esc(v.pressure):'Non précisée'}</span></div><dl><div><dt>Tête / chapeau</dt><dd>${v.head?esc(v.head):v.mode==='Bouteille'?'Non précisé dans le tableau':v.mode==='Cadre'?'Non renseigné pour ce cadre':'Sans indication dans le tableau'}</dd></div>${v.content?`<div><dt>Contenu annoncé</dt><dd>${esc(v.content)}</dd></div>`:''}</dl><p class="supply-reference"><span>Réf.</span> <code>${esc(v.reference)}</code>${v.note?`<small>${esc(v.note)}</small>`:''}</p></li>`).join('')}</ul><p class="footnote">${source}. Taille en litres : volume du récipient, distinct du contenu gazeux en m³. Pression publiée de remplissage, pas un réglage de soudage. Les conditions de référence du contenu en m³ ne sont pas précisées dans ce tableau : aucune conversion n’est effectuée. Stock et disponibilité à confirmer.</p><details class="technical-details"><summary>Raccordements publiés</summary><p>${esc(w.connections)}</p><p class="footnote">Description de la page produit ; elle ne prouve pas l’équipement de chaque référence. Vérifier le raccord et le détendeur du conditionnement livré.</p></details></section><section><h2>Composition & classification</h2><p class="mix-summary">${esc(g.composition)}</p><dl class="specification-list">${w.specifications.map(s=>`<div><dt>${esc(s.component)}</dt><dd>${esc(s.value)}${s.tolerance?' <small>'+esc(s.tolerance)+'</small>':''}</dd></div>`).join('')}</dl><p class="standard-label">${esc(w.standard)}</p><p class="footnote">Désignation publiée pour le soudage. Pourcentages et tolérances selon la fiche fabricant ; une marque n’est pas une formule moléculaire.</p><details class="technical-details"><summary>Impuretés publiées</summary><p class="footnote">Unité de l’en-tête : ${esc(w.impurityUnit)}. La mention « H₂O (5 bar) » est reprise de la source.</p><dl class="specification-list">${w.impurities.map(s=>`<div><dt>${esc(s.component)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}</dl><p class="footnote">Une valeur sans signe ≤ est conservée telle quelle, sans inventer une limite. Source : ${source}.</p></details></section>`,
    safety: `<section><h2>Sécurité du produit</h2><div class="product-safety ${w.safety.classificationCode==='1F'?'flammable':''}"><h3>${esc(w.safety.flammability)}</h3><p>Gaz sous pression : protéger de l’échauffement. ${w.safety.classificationCode==='1F'?'Tenir éloigné des sources d’inflammation ; suivre les consignes spécifiques de la FDS.':'Risque d’asphyxie en atmosphère appauvrie en oxygène ; assurer une ventilation adaptée.'}</p><p class="footnote">Classe ADR ${esc(w.safety.adrClass)} · code ${esc(w.safety.classificationCode)} · <a href="${esc(g.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source fabricant</a>. Synthèse non exhaustive.</p></div></section>${w.notes.length?`<section><h2>Points à confirmer</h2><ul class="precautions product-notes">${w.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></section>`:''}`,
    checklist: `<details class="technical-details client-checklist"><summary>Préparer l’échange client</summary><p class="footnote">Repère pratique du guide, à compléter avec le technicien soudage.</p><ul><li>Nuance exacte, épaisseur et préparation des pièces.</li><li>Procédé, mode de transfert, fil et position de soudage.</li><li>Objectif : aspect, corrosion, cadence, pénétration ou finition.</li><li>Volume consommé, mobilité, référence de bouteille et raccord disponible.</li><li>Compatibilité et qualification du mode opératoire de soudage.</li></ul><p>Ce guide n’établit pas de DMOS et ne remplace pas une validation technique de l’application.</p></details>`
  };
}
const sheetTabs=[['essential','Essentiel'],['safety','Sécurité'],['transport','Transport'],['technical','Technique']];
function selectSheetTab(key) {
  if(!sheetTabs.some(([id])=>id===key))return;
  document.querySelectorAll('[role=tab][data-sheet-tab]').forEach(tab=>{const active=tab.dataset.sheetTab===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
  document.querySelectorAll('[role=tabpanel][data-panel]').forEach(panel=>panel.hidden=panel.dataset.panel!==key);
}
function sheetNavigation() {
  return `<div class="fiche-tabs" role="tablist" aria-label="Rubriques de la fiche">${sheetTabs.map(([id,label],i)=>`<button type="button" role="tab" id="tab-${id}" data-sheet-tab="${id}" aria-controls="panel-${id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${label}</button>`).join('')}</div>`;
}
function sheetPanels(panels) {
  return sheetTabs.map(([id],i)=>`<div class="fiche-panel" role="tabpanel" id="panel-${id}" data-panel="${id}" aria-labelledby="tab-${id}" tabindex="0" ${i===0?'':'hidden'}>${panels[id]}</div>`).join('');
}
function fdsAction(g) {
  if(!g.fds)return '';
  const label='Fiche de données de sécurité';
  const note=g.fds.kind==='portal'?'Portail fournisseur · choisir le conditionnement':g.fds.kind==='individual'?'Document individuel · connexion nécessaire':'Lien fabricant · révision à vérifier';
  return `<a class="document-action fiche-fds" href="${esc(g.fds.url)}" target="_blank" rel="noopener noreferrer"><span>${label}<small>${note}</small></span>${icon('external')}</a>`;
}
function identificationSummary(g,physical=false) {
  const transport=g.transport?.length?g.transport.map(t=>`<span class="transport-pair"><small>${esc(t.state)}</small><strong>UN ${esc(t.number)}</strong></span>`).join(''):'<span class="unavailable">À vérifier dans la FDS</span>';
  const shoulder=g.shoulder?`<span class="ogive-value"><span class="colour-swatch ral-${esc(g.shoulder.ral)}" aria-hidden="true"></span><span>${esc(g.shoulder.name)} · RAL ${esc(g.shoulder.ral)}</span></span>`:'<span class="unavailable">Non documentée</span>';
  return `<dl class="fiche-summary"><div class="transport-summary"><dt>Transport</dt><dd>${transport}</dd></div><div><dt>Ogive</dt><dd>${shoulder}</dd></div>${physical?`<div><dt>Masse volumique du gaz<small>15 °C · 1,013 bar abs.</small></dt><dd>${g.density===null?'<span class="unavailable">Non retenue¹</span>':`${fmt(g.density)} <span class="unit">kg/m³</span>`}</dd></div>`:''}</dl>${physical&&g.densityNote?`<p class="footnote summary-note">¹ ${esc(g.densityNote)}</p>`:''}`;
}
function sourcesDisclosure(g) {
  return `<details class="fiche-sources"><summary><span><strong>Sources & limites</strong><small>${g.sources.length} source${g.sources.length>1?'s':''} · Liens externes, connexion nécessaire</small></span>${icon('chevron')}</summary><ul class="sources">${sourceLinks(g.sources)}</ul>${g.sourceUrl?`<a class="home-link" href="${esc(g.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(g.sourceLabel)} Air Liquide ${icon('external')}</a>`:''}<p class="footnote">Consultées le 21 octobre 2026. La FDS à jour du produit livré et les consignes du site restent indispensables. Les sources externes ne sont pas enregistrées hors ligne.</p><p class="footnote">${g.kind==='product'?'Composition et conditionnements selon la référence publiée.':'Valeurs de la substance de référence, pas d’une bouteille donnée.'} L’étiquette identifie le contenu ; la teinte de l’ogive à l’écran est indicative.</p></details>`;
}
function applicationSection(g) {
  const items=g.applicationDetails?.length?g.applicationDetails.map(a=>`<li><h3>${esc(a.title)}</h3><p>${esc(a.detail)}</p></li>`).join(''):g.applications.length?g.applications.map(a=>`<li><p>${esc(a)}</p></li>`).join(''):`<li><p>${esc(g.applicationsNote)}</p></li>`;
  return `<section class="fiche-applications" aria-label="Applications industrielles"><h2>Applications principales</h2><ul class="application-rows">${items}</ul></section>`;
}
function ficheShell(g,header,panels,back,label) {
  $('#main').innerHTML=`<article class="fiche"><div class="topbar detail-bar"><a href="${back}" class="back">${icon('back')}${esc(label)}</a>${bookmark(g)}</div>${header}${sheetNavigation()}${sheetPanels(panels)}${sourcesDisclosure(g)}<p class="catalogue-note">Guide indépendant, sans affiliation ni validation par Air Liquide ou l’INRS.</p></article>`;
}
function productDetail(g) {
  const range=data.ranges.find(r=>r.id===g.range),w=g.welding,parts=w?weldingDetail(g):null;
  const header=`<header class="fiche-title product-title"><div><p class="fiche-kicker">${esc(range.name)}${w?' · '+esc(w.category)+' · '+esc(w.manufacturerCode):''}</p><h1 tabindex="-1">${esc(g.name)}</h1><p>Produit commercial Air Liquide</p>${w?`<div class="fiche-badges"><span class="fiche-badge ${w.safety.classificationCode==='1F'?'hazard':''}">${esc(w.safety.flammability)}</span><span class="fiche-badge pressure-badge">Sous pression</span></div>`:''}</div></header>`;
  const constituents=`<section><h2>Constituants</h2><ul class="gas-list">${gasRows(g.components.map(id=>data.gases.find(x=>x.id===id)).filter(Boolean))}</ul><p class="footnote">Ces fiches décrivent les constituants séparés ; leurs propriétés et dangers ne doivent pas être transposés au mélange. Les propriétés physiques du produit commercial ne sont pas calculées.</p></section>`;
  const composition=`<section><h2>Composition publiée</h2><div class="reading composition"><p><strong>${esc(g.composition)}</strong></p><p>Vérifier les teneurs et tolérances de la référence livrée. Une marque commerciale n’est pas une formule moléculaire.</p></div></section>`;
  const shortcuts=w?`<button class="fiche-shortcut" data-jump="product-supply"><span><strong>Formats, pression & chapeau</strong><small>${w.variants.length} référence(s) publiée(s) · Voir chaque conditionnement</small></span>${icon('chevron')}</button>`:'';
  ficheShell(g,header,{
    essential:`${parts?parts.overview:`<p class="mix-summary">${esc(g.composition)}</p>`}${identificationSummary(g)}${fdsAction(g)}${shortcuts}${parts?parts.uses+parts.checklist:applicationSection(g)}`,
    safety:`${parts?parts.safety:`<section><h2>Sécurité du produit</h2><p class="reading">Les dangers et précautions de cette référence ne sont pas détaillés dans cette édition. Consulter la FDS du produit livré ; ne pas déduire la classification du mélange à partir de ses constituants.</p></section>`}${fdsAction(g)}<p class="footnote">${esc(g.fds.note)}</p>`,
    transport:documents(g),
    technical:`${parts?parts.technical:composition}${constituents}`
  },`#gamme/${g.range}`,range.name);nav('gammes');
}
function gasTechnical(g) {
  const molecular=g.formula!==g.elements[0]||g.elements.length>1;
  const physical=`<section><h2>Propriétés physiques</h2><dl class="properties"><div><dt>Masse molaire<small>Valeur de référence de la substance</small></dt><dd>${fmt(g.molarMass)} <span>g/mol</span></dd></div><div><dt>Masse volumique<small>Phase gazeuse · 15 °C · 1,013 bar absolu</small></dt><dd>${g.density===null?'<span>Non retenue¹</span>':`${fmt(g.density)} <span>kg/m³</span>`}</dd></div><div><dt>${!g.transition?'Transition de phase':g.transition.kind==='sublimation'?'Sublimation':'Ébullition'}<small>À 1,013 bar absolu</small></dt><dd>${g.transition?`${fmt(g.transition.temperatureC)} <span>°C</span>`:'<span>Voir note²</span>'}</dd></div></dl><p class="footnote">Valeurs de l’<a href="${esc(g.sources[0].url)}" target="_blank" rel="noopener noreferrer">Encyclopédie des gaz Air Liquide</a>${g.id==='air'?' ; mélange de référence':' ; substance de référence'}. Elles ne décrivent pas les conditions d’une bouteille.</p>${g.densityNote?`<p class="footnote">¹ ${esc(g.densityNote)}</p>`:''}${g.transitionNote?`<p class="footnote">² ${esc(g.transitionNote)}</p>`:''}</section>`;
  const formula=`<section><h2>Bien lire la formule</h2><div class="reading"><p>${g.formulaNote?esc(g.formulaNote):molecular?`<strong>${esc(g.displayFormula)}</strong> est une formule moléculaire. Symboles des éléments : <strong>${g.elements.map(esc).join(', ')}</strong>.`:`<strong>${esc(g.displayFormula)}</strong> désigne un gaz monoatomique et le symbole de son élément.`}</p><p>${esc(g.note)}</p><p>État de référence : ${esc(g.phaseAtReference)} à 15 °C et 1,013 bar.</p></div></section>`;
  return physical+formula+applicationSection(g);
}
function referenceRiskCard(g) {
  const oxygen=g.referenceSheet;
  const symbols=oxygen?`<div class="reference-risk-symbols"><div><img src="./icons/hazards/ghs03.png" alt="Pictogramme SGH03, comburant" width="48" height="48"><span><strong>Comburant</strong><small>SGH03</small></span></div><div><img src="./icons/hazards/ghs04.png" alt="Pictogramme SGH04, gaz sous pression" width="48" height="48"><span><strong>Sous pression</strong><small>SGH04</small></span></div></div>`:`<div class="reference-risk-heading">${icon('alert')}<h2>${esc(g.family)}</h2></div>`;
  const precautions=oxygen?oxygen.practices.slice(0,3):g.precautions;
  return `<section class="reference-risk-card" aria-label="Risques principaux">${symbols}${g.risks.map(r=>`<p>${esc(r)}</p>`).join('')}<ul>${precautions.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></section>`;
}
function referenceAtmosphere(g) {
  if(!g.referenceSheet)return '';
  return `<section class="reference-atmosphere"><h2>Repères atmosphère</h2><div class="atmosphere-scale" role="img" aria-label="Air : environ 20,9 % d’oxygène. Éviter un enrichissement au-delà de 23,5 %. Cette échelle schématique ne garantit pas la sécurité d’une atmosphère."><div class="atmosphere-air">Air 20,9 %</div><div class="atmosphere-bar"><span></span><span></span><span></span><i></i></div><div class="atmosphere-values"><span>Appauvrissement</span><span>23,5 %</span></div><div class="atmosphere-captions"><span>Moins d’oxygène</span><span>Enrichissement</span></div></div><div class="atmosphere-notes"><p>Incolore et non détectable à l’odeur : prévoir une détection adaptée au risque.</p><p>Densité par rapport à l’air : <strong>1,11</strong> à 15 °C et 1,013 bar. La ventilation et la configuration du lieu restent déterminantes.</p></div><p class="footnote">Repères schématiques de prévention ; ils ne constituent pas une autorisation d’accès. <a href="${esc(g.referenceSheet.atmosphere.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source, rubrique 8</a>.</p></section>`;
}
function referenceIdentityTiles(g) {
  const items=(g.transport||[]).map(t=>`<div><dt>${g.id==='oxygene'?(t.number==='1072'?'Gaz comprimé':'Liquide (LOX)'):esc(t.state)}</dt><dd>UN ${esc(t.number)}</dd></div>`);
  if(g.referenceSheet)items.push('<div><dt>Étiquettes ADR</dt><dd>2.2 + 5.1</dd></div>');
  if(!items.length)items.push('<div><dt>Numéro ONU</dt><dd class="unknown">À vérifier dans la FDS</dd></div>');
  items.push(`<div><dt>Ogive</dt><dd>${g.shoulder?`<span class="colour-swatch ral-${esc(g.shoulder.ral)}" aria-hidden="true"></span>${esc(g.shoulder.name)}`:'<span class="unknown">Non documentée</span>'}</dd></div>`);
  return `<dl class="reference-identity-tiles">${items.join('')}</dl>`;
}
function referenceCodeRows(title,items,kind) {
  return `<section class="reference-code-section"><h2>${title}</h2><ul class="reference-code-rows ${kind}">${items.map(r=>`<li><strong>${esc(r.code)}</strong><div><p>${esc(r.summary)}</p><small>${esc(r.scope)}</small></div></li>`).join('')}</ul></section>`;
}
function referenceSafety(g) {
  const ref=g.referenceSheet;
  if(!ref)return `<section><h2>Risques & précautions</h2>${referenceRiskCard(g)}<ul class="precautions">${g.precautions.map(p=>`<li>${esc(p)}</li>`).join('')}<li>Adapter les précautions au produit livré et aux consignes du site.</li></ul><p class="footnote">Synthèse non exhaustive. Les mentions H et P de cette référence ne sont pas détaillées ici : consulter sa FDS.</p></section>${fdsAction(g)}`;
  return `${referenceCodeRows('Mentions de danger',ref.hazards,'hazard-codes')}${referenceCodeRows('Conseils de prudence',ref.classification.precautions,'precaution-codes')}<section><h2>Bonnes pratiques</h2><ul class="reference-practices">${ref.practices.map(p=>`<li>${icon('check')}<span>${esc(p)}</span></li>`).join('')}</ul></section><section class="reference-emergency"><h2>Conduite à tenir</h2><a class="emergency-call" href="tel:112">Appeler le 112</a>${ref.actions.map(a=>`<div class="emergency-card"><h3>${esc(a.title)}</h3><ol>${a.steps.map(p=>`<li>${esc(p)}</li>`).join('')}</ol></div>`).join('')}<p class="footnote">Repères issus des FDS, pas une procédure d’intervention. Suivre le plan d’urgence du site. <a href="https://lannuaire.service-public.gouv.fr/centres-contact/R12069" target="_blank" rel="noopener noreferrer">Numéro d’urgence européen</a>.</p></section><p class="footnote reference-scope">${esc(ref.scopeLimit)} Mentions H/P synthétisées : les libellés réglementaires complets figurent dans les FDS citées.</p>${fdsAction(g)}`;
}
function referenceTransport(g) {
  const ref=g.referenceSheet;
  if(!ref)return documents(g);
  return `<div id="product-documents"><div class="reference-adr-heading"><img src="./icons/hazards/adr-2-2.svg" alt="Illustration de l’étiquette ADR 2.2" width="56" height="56"><img src="./icons/hazards/adr-5-1.svg" alt="Illustration de l’étiquette ADR 5.1" width="56" height="56"><span><strong>Classe 2 · Gaz</strong><small>Étiquettes 2.2 + 5.1</small></span></div>${ref.transport.map(t=>`<section class="reference-transport-card"><div class="transport-card-heading"><dl class="un-plate" aria-label="Numéro d’identification du danger ${esc(t.hazardIdentificationNumber)}, numéro ONU ${esc(t.un)}"><dt>${esc(t.hazardIdentificationNumber)}</dt><dd>${esc(t.un)}</dd></dl><div><h2>UN ${esc(t.un)}</h2><p>${esc(t.state)}</p></div></div><dl class="transport-card-meta"><div><dt>Code</dt><dd>${esc(t.classificationCode)}</dd></div><div><dt>N° danger</dt><dd>${esc(t.hazardIdentificationNumber)}</dd></div><div><dt>Forme</dt><dd>${t.un==='1072'?'Gaz':'LOX'}</dd></div></dl></section>`).join('')}<div class="reference-shoulder"><span>Couleur d’ogive<small>EN 1089-3 · l’étiquette fait foi</small></span><span class="colour-swatch ral-${esc(g.shoulder.ral)}" aria-hidden="true"></span><strong>${esc(g.shoulder.name)} · RAL ${esc(g.shoulder.ral)}</strong></div><p class="footnote">Repères ADR : ils ne remplacent pas les documents de transport du produit livré. Les codes sont 1O et 3O, avec la lettre O.</p><p class="footnote">${esc(ref.scopeLimit)}</p><p class="footnote">Illustrations ADR issues des visuels fournis ; elles ne sont pas destinées à l’étiquetage d’un colis. <a href="${esc(g.shoulder.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source de la couleur d’ogive</a>.</p>${fdsAction(g)}<p class="footnote">${esc(g.fds.note)}</p></div>`;
}
function referenceTechnical(g) {
  if(!g.referenceSheet)return gasTechnical(g);
  const p=g.referenceSheet.physical;
  const row=(label,condition,value,unit)=>`<div><dt>${label}<small>${condition}</small></dt><dd>${value} <span>${unit}</span></dd></div>`;
  return `<section><h2>Gaz</h2><dl class="properties">${row('Masse molaire','Substance de référence',fmt(g.molarMass),'g/mol')}${row('Masse volumique','15 °C · 1,013 bar abs.',fmt(g.density),'kg/m³')}${row('Densité / air','15 °C · 1,013 bar abs.',fmt(p.gasRelativeDensityAir.value),'')}</dl></section><section><h2>Liquide</h2><dl class="properties">${row('Ébullition','À 1,013 bar absolu',fmt(p.boilingPoint.value),'°C')}${row('Masse volumique','À l’ébullition · 1,013 bar abs.',fmt(p.liquidDensity.value),'kg/m³')}${row('Expansion','1 L liquide à l’ébullition → gaz à 15 °C · 1,013 bar abs.',fmt(p.gasLiquidVolumeRatio.value),'L')}</dl></section><section><h2>Points remarquables</h2><dl class="properties">${row('Point critique','Température · pression',fmt(p.criticalPoint.temperatureC)+' °C · '+fmt(p.criticalPoint.pressureBar),'bar')}${row('Point triple','Pression : 0,0015 bar',fmt(p.triplePoint.temperatureC),'°C')}</dl></section><section><h2>Conditionnements</h2><div class="reference-pack-grid"><div><h3>Bouteille</h3><p>Gaz comprimé ; taille et pression selon référence.</p></div><div><h3>Cadre</h3><p>Bouteilles assemblées ; caractéristiques à confirmer.</p></div><div><h3>Réservoir LOX</h3><p>Oxygène liquide réfrigéré, stockage cryogénique.</p></div><div><h3>Récipient mobile</h3><p>Liquide cryogénique ; équipement selon fourniture.</p></div></div><p class="footnote">Modes de fourniture génériques ; aucune taille, pression ni tête d’une bouteille France n’est déduite de la substance. Confirmer le conditionnement proposé avec le fournisseur.</p></section>${applicationSection(g)}<details class="technical-details"><summary>Bien lire la formule</summary><p><strong>O₂</strong> est une formule moléculaire ; <strong>O</strong> est le symbole de l’élément. LOX désigne l’oxygène liquide. Les masses volumiques du gaz et du liquide sont distinguées ci-dessus.</p><p>${esc(g.note)}</p></details><p class="footnote">Valeurs de l’<a href="${esc(g.sources[0].url)}" target="_blank" rel="noopener noreferrer">Encyclopédie des gaz Air Liquide</a>. Elles ne décrivent pas les conditions d’une bouteille.</p>`;
}
function detail(g) {
  if(g.kind==='product'){productDetail(g);return;}
  const badges=g.family.split(' · ').map(label=>`<span class="fiche-badge ${/comburant|inflammable|toxique|corrosif/i.test(label)?'hazard':''}">${esc(label)}</span>`).join('');
  const pressure=g.transport?.some(t=>/comprimé/i.test(t.state))?'<span class="fiche-badge pressure-badge">Sous pression</span>':'';
  const header=`<header class="fiche-title"><span class="${formulaClass(g)} large" aria-label="${g.formula?'Formule '+esc(g.formula):'Air, mélange'}">${esc(g.displayFormula)}</span><div><h1 tabindex="-1">${esc(g.name)}</h1><p>${esc(g.subtitle)} · CAS ${esc(g.cas)}</p><div class="fiche-badges">${g.referenceSheet?'<span class="fiche-badge danger-word">DANGER</span>':''}${badges}${pressure}</div></div></header>`;
  ficheShell(g,header,{essential:referenceRiskCard(g)+referenceAtmosphere(g)+referenceIdentityTiles(g)+fdsAction(g),safety:'<div role="group" aria-label="Risques & précautions">'+referenceSafety(g)+'</div>',transport:referenceTransport(g),technical:referenceTechnical(g)},'#catalogue','Catalogue');nav('catalogue');
}

function reperes() {
  $('#main').innerHTML=`${intro('Repères','Comprendre, puis vérifier.')}<section><h2>Un guide indépendant</h2><div class="reading"><p>${data.gases.length} fiches couvrant toutes les entrées de l’<a href="https://encyclopedia.airliquide.com/fr" target="_blank" rel="noopener noreferrer">encyclopédie publique Air Liquide</a> consultée le 21 octobre 2026. S’y ajoutent ${data.products.length} références commerciales documentées, accessibles dans <a href="#gammes">Gammes</a>. Le catalogue commercial est partiel. Ce périmètre comprend aussi l’air, des liquides, des isomères et des formes de l’hydrogène. Il ne représente pas tous les mélanges ou grades commercialisés.</p><p>Air Liquide est cité comme source. Cette application n’est ni éditée, ni approuvée, ni sponsorisée par Air Liquide. Aucun logo ou visuel de cette entreprise n’est utilisé.</p><p>La FDS à jour du produit livré et les consignes de votre site restent indispensables avant une intervention. Ce guide n’est pas un outil de dimensionnement ou une procédure d’urgence.</p></div></section><section><h2>Les unités, sans ambiguïté</h2><div class="reading"><p><strong>kg/m³</strong> : masse volumique du gaz à <strong>15 °C et 1,013 bar absolu</strong>. Ce n’est pas la masse volumique du liquide ni celle du gaz comprimé dans une bouteille.</p><p><strong>g/mol</strong> : masse d’une mole de la substance ; valeur de référence indépendante de la phase dans cette fiche.</p><p><strong>°C</strong> : transition de phase à 1,013 bar absolu. CO₂ et C₂H₂ : sublimation. L’air est un mélange. Les transitions manquantes ou assorties d’une autre référence sont expliquées dans la fiche.</p><p>Les valeurs sont transcrites des tableaux des sources, sans extrapolation. Une valeur absente, ambiguë ou incohérente est signalée, jamais remplacée par zéro. Certaines applications restent non documentées. Les usages historiques des réfrigérants et halons ne valent pas autorisation actuelle d’emploi. La précision publiée n’est pas une garantie d’incertitude de mesure.</p></div></section><section><h2>Formule, symbole, abréviation</h2><div class="reading"><p><strong>O₂, N₂, H₂</strong> sont des molécules ; <strong>O, N, H</strong> sont des symboles d’éléments. <strong>Ar, He, Ne</strong> désignent des gaz monoatomiques.</p><p><strong>CO ≠ Co</strong> : monoxyde de carbone et cobalt. Les majuscules comptent dans une formule.</p><p><strong>LOX, LIN, LAR</strong> désignent respectivement l’oxygène, l’azote et l’argon liquides. La recherche accepte ces abréviations, mais la masse volumique affichée reste celle de la phase gazeuse indiquée.</p><p><a href="https://my.airliquide.com/products-services/our-supply-modes" target="_blank" rel="noopener noreferrer">Source des abréviations : Air Liquide</a></p></div></section><section><h2>Sur votre iPhone</h2><div class="reading"><ol><li>Ouvrez ce site dans Safari.</li><li>Dans le menu de partage, choisissez l’ajout à l’écran d’accueil (le libellé peut varier selon iOS).</li><li>Avant de quitter le réseau, attendez la mention « Hors ligne disponible ».</li></ol><p>Les ${allEntries().length} fiches, la recherche et les favoris sont alors consultables sans réseau. Les sites sources ne sont pas enregistrés. Une première visite hors ligne ne peut pas installer l’application.</p><p>iOS peut supprimer les données locales pour libérer de l’espace. Les favoris ne sont pas synchronisés entre appareils et peuvent être distincts entre Safari et l’application installée.</p></div></section><section><h2>Apparence</h2><div class="setting"><label for="theme-select">Thème</label><select id="theme-select"><option value="system">Automatique</option><option value="light">Clair</option><option value="dark">Sombre</option></select></div></section><section><h2>Données & confidentialité</h2><div class="reading"><p>Édition ${data.version} · Sources consultées le 21 octobre 2026. Pas de mise à jour automatique des propriétés depuis les sites sources. Une nouvelle édition du guide est proposée lorsqu’elle est publiée.</p><p>Aucun compte, aucune publicité et aucun outil de suivi ajouté par l’application. Favoris et thème sont enregistrés localement. L’hébergement GitHub Pages et les sources externes peuvent traiter des données de connexion selon leurs propres politiques.</p><p><a href="https://github.com/Bidibulle50/guide-des-gaz" target="_blank" rel="noopener noreferrer">Consulter le code et la documentation</a></p></div></section>`;
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
  else if(route==='#reperes') {reperes();document.title='Repères · Guide des gaz';}
  else {catalogue();document.title='Guide des gaz';}
  syncTheme();
  if(lastRoute) (route==='#catalogue'?$(catalogueOverview&&!query.trim()?'#catalogue-home-heading':'#catalogue-heading'):$('h1'))?.focus({preventScroll:true});
  window.scrollTo(0,route==='#catalogue'?catalogueScroll:0);lastRoute=route;
}
document.addEventListener('click', e=> {
  const t=e.target.closest('button,a');if(!t)return;
  if(t.dataset.weldingField){const field=t.dataset.weldingField;weldingJourney[field]=t.dataset.value;if(field==='material'){weldingJourney.process=null;weldingJourney.need=null;}if(field==='process')weldingJourney.need=null;weldingJourney.confirmed=[];refreshWeldingGuide();}
  if(t.hasAttribute('data-welding-reset')){weldingJourney={material:null,process:null,need:null,confirmed:[]};refreshWeldingGuide();}
  if(t.dataset.weldingEdit){const field=t.dataset.weldingEdit;weldingJourney[field]=null;if(field==='material')weldingJourney.process=null;if(field!=='need')weldingJourney.need=null;weldingJourney.confirmed=[];refreshWeldingGuide();}
  if(t.dataset.weldingConfirm){weldingJourney.confirmed=[...new Set([...weldingJourney.confirmed,t.dataset.weldingConfirm])];refreshWeldingGuide();}
  if(t.hasAttribute('data-welding-unknown')){if(!weldingJourney.material)weldingJourney.material='unknown';weldingJourney.process='unknown';weldingJourney.need='unknown';refreshWeldingGuide();}
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
