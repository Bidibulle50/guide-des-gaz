import {ficheMarkup, sheetStates} from './fiche.js';
import { iconMarkup } from './ui-icons.js';
import { ESSENTIAL_IDS, catalogueSelection, readFavorites, escapeHtml as esc } from './core.js';
import { MATERIALS, PROCESSES, NEEDS, availableProcesses, weldingSelection } from './welding.js';
const $ = s => document.querySelector(s);
const icon = (key, cls='') => (iconMarkup[key] || '').replace('<svg ', `<svg aria-hidden="true" focusable="false" class="icon ${cls}" `);
const brand = '<img class="brand" src="./icons/brand-cobalt-128.png" alt="" width="48" height="48">';
const allEntries = () => [...data.gases, ...(data.products || [])];
let data, favorites = new Set(), query = '', mode = 'essentials', catalogueScroll = 0, catalogueOverview = true, toastTimer, offlineReady = false, waitingWorker;
let weldingJourney={group:null,material:null,process:null,need:null,confirmed:[]};
let weldingSupportOpen=false;
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

function sourceLinks(sources) { return sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${icon('external')}<span><strong>${esc(s.title)}</strong><small>${esc(s.scope)}${s.checked?' · Consultation : '+esc(s.checked):''}</small></span>${icon('chevron','chevron')}</a></li>`).join(''); }
const selectionName=(options,id)=>options.find(x=>x.id===id)?.name||'';
const weldingMaterialGroups=[
  {id:'acier',name:'Acier',detail:'Courant, revêtu ou armatures',materials:['carbone','revetu','armatures']},
  {id:'inox',name:'Inox',detail:'Nuance connue ou à préciser',materials:['inox','austenitique','duplex','inox-azote']},
  {id:'aluminium',name:'Aluminium',detail:'Aluminium et ses alliages',materials:['aluminium']},
  {id:'autre',name:'Autre métal',detail:'Cuivre, nickel…',materials:['cuivre','nickel']}
];
const weldingChoiceLabels={
  carbone:{name:'Acier courant',detail:'Acier carbone, non ou faiblement allié'},
  revetu:{name:'Acier galvanisé / revêtu',detail:'Le client indique un revêtement'},
  armatures:{name:'Fer à béton / treillis',detail:'Barres ou treillis d’armature'},
  cuivre:{name:'Cuivre et alliages cuivreux',detail:'Cuivre et ses alliages'},
  nickel:{name:'Nickel et alliages',detail:'Nickel et ses alliages'},
  inox:{name:'Je ne connais pas la nuance',detail:'Continuer avec un inox à préciser'},
  austenitique:{name:'Inox austénitique',detail:'Nuance confirmée par le client'},
  duplex:{name:'Duplex / Superduplex',detail:'Nuance confirmée par le client'},
  'inox-azote':{name:'Inox enrichi en azote',detail:'Nuance confirmée par le client'},
  courant:{name:'Trouver un gaz adapté',detail:'Partir du métal et du procédé'},
  finition:{name:'Améliorer la finition',detail:'Aspect des soudures et travail de reprise'},
  cadence:{name:'Gagner en productivité',detail:'Vitesse et organisation du soudage'},
  fin:{name:'Travailler des tôles fines',detail:'Épaisseur exacte à relever'},
  epais:{name:'Souder des pièces épaisses',detail:'Épaisseur exacte à relever'},
  automatique:{name:'Souder en automatique ou avec un robot',detail:'Mode de travail confirmé par le client'}
};
function weldingChoice(options,field){
  return `<ul class="choice-list">${options.map(original=>{const o={...original,...weldingChoiceLabels[original.id]};return `<li><button data-welding-field="${field}" data-value="${esc(o.id)}"><span><strong>${esc(o.name)}</strong><small>${esc(o.detail)}</small></span>${icon('chevron','chevron')}</button></li>`;}).join('')}</ul>`;
}
function weldingClientQuestion(){
  const questions={
    cadence:'Où perdez-vous le plus de temps aujourd’hui : soudage, reprises ou changements de bouteille ?',
    finition:'Quelles reprises après soudage vous prennent le plus de temps ?',
    fin:'Quelles épaisseurs travaillez-vous et quel résultat souhaitez-vous améliorer ?',
    epais:'Quelles épaisseurs et quelles exigences d’assemblage faut-il prendre en compte ?',
    automatique:'Quel point souhaitez-vous améliorer sur la ligne : cadence, régularité ou reprises ?'
  };
  return questions[weldingJourney.need]||'Quel gaz utilisez-vous aujourd’hui, et que souhaitez-vous conserver ou améliorer ?';
}
function weldingArguments(m,open=false){
  const benefits=m.product.welding.benefits||[];
  const source=m.product.sources.find(s=>s.url===m.product.sourceUrl);
  return `<details class="welding-arguments" data-argument-for="${esc(m.product.id)}" ${open?'open':''}>
    <summary><span><strong>Les bons arguments</strong><small>Technique & intérêt client</small></span>${icon('chevron')}</summary>
    <div class="argument-content">
      <div><h4>${benefits.length?'L’intérêt client':'L’intérêt à préciser'}</h4>${benefits.length?benefits.map(b=>`<p>${esc(b)}</p>`).join(''):'<p>Aucun bénéfice comparatif n’est documenté dans les sources consultées pour ce produit. Partir de l’usage publié, puis préciser les attentes du client.</p>'}</div>
      <div class="argument-question"><h4>La question à poser</h4><p>« ${esc(benefits.length?weldingClientQuestion():'Quel conditionnement correspond à votre consommation et à votre fréquence d’utilisation ?')} »</p></div>
      <a class="argument-source" href="${esc(m.product.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source Air Liquide${source?.checked?' · '+esc(source.checked):''} ${icon('external')}</a>
      <p class="argument-source-note">${benefits.length?'Bénéfices annoncés':'Usages publiés'} par le fabricant. Question d’entretien proposée par le guide.</p>
    </div>
  </details>`;
}
function weldingSupport(){
  const s=weldingJourney;
  const validMaterial=MATERIALS.some(m=>m.id===s.material),validProcess=PROCESSES.some(p=>p.id===s.process);
  const context=[validMaterial?selectionName(MATERIALS,s.material):'',validProcess?selectionName(PROCESSES,s.process):''].filter(Boolean).join(' · ');
  const technical=!validMaterial?'Quel métal et quelle nuance figurent sur le plan, la pièce ou le document du client ?':!validProcess?'Quel procédé le client utilise-t-il ? Relever le nom dans son mode opératoire, puis préciser le fil ou le métal d’apport.':'Quelle nuance exacte, quelle épaisseur, quel fil et quel régime de soudage faut-il confirmer ?';
  const selection=validMaterial&&validProcess&&s.need?weldingSelection(data.products,s):null;
  const conditions=selection?[...new Set(selection.conditional.map(m=>m.condition.text))]:[];
  return `<details class="welding-support" id="welding-support" ${weldingSupportOpen?'open':''}>
    <summary><span class="support-symbol">${icon('compass')}</span><span><strong>Appui en rendez-vous</strong><small>Technique & commercial</small></span>${icon('chevron')}</summary>
    <div class="support-content">
      <p class="support-context">${context?esc(context):'Pour préparer et approfondir l’échange'}</p>
      <div class="support-grid">
        <section><span class="support-label">Regard ingénieur</span><h3>Qualifier l’application</h3><p>${esc(technical)}</p>
          ${conditions.length?`<p class="support-mini-title">Points ouverts dans votre sélection</p><ul>${conditions.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`:''}
          ${s.material==='inox'?'<p>La nuance inox reste inconnue. La présélection ne couvre pas les emplois réservés à une nuance précise.</p>':''}
          <p class="support-next"><strong>Suite technique</strong> Faire confirmer la compatibilité avec le mode opératoire par le référent soudage avant un changement de gaz. Reprendre la FDS du produit livré.</p>
        </section>
        <section><span class="support-label">Regard commercial senior</span><h3>Faire avancer la proposition</h3><p>« ${esc(weldingClientQuestion())} »</p>
          <details class="sales-objection"><summary>« Votre gaz est plus cher »</summary><p>« Que comparez-vous : le prix du gaz, la consommation ou le coût de l’opération complète ? »</p><p>Relever les volumes, les temps de reprise, le conditionnement et les tarifs réels. Proposer une comparaison mesurée ; aucun gain économique n’est calculé dans ce guide.</p></details>
          <details class="sales-objection"><summary>« Mon gaz actuel me convient »</summary><p>« Qu’est-ce qui fonctionne bien et quel point mérite encore d’être amélioré ? »</p><p>Partir de l’usage actuel et de l’objectif exprimé. Un autre gaz ne devient une piste qu’après examen de ses conditions d’emploi.</p></details>
          <p class="support-next"><strong>Suite commerciale</strong> Convenir d’une prochaine action : précision technique, essai encadré ou proposition selon la consommation, les conditionnements et la disponibilité confirmée.</p>
        </section>
      </div>
      <p class="support-note">Conseils de préparation, disponibles hors ligne. Les arguments produit renvoient aux sources Air Liquide dans les résultats. Les documents externes nécessitent une connexion.</p>
    </div>
  </details>`;
}
function weldingCards(matches,{openArguments=false}={}){
  const confirmations={'automatique':'Le client confirme le mode automatique','fil-plein':'Le client confirme le fil plein','pulse-fil-plein':'Le client confirme : MAG pulsé et fil plein','fil-fourre-inox':'Le client confirme le fil fourré inox'};
  return matches.map(m=>`<article class="welding-result"><div class="welding-result-heading"><h3>${esc(m.product.name)}</h3><span>${esc(m.product.welding.category==='Référents'?'Référent':'Technique')}</span></div><p>${esc(m.why)}</p>${m.needMatch?'<p class="need-evidence">Votre objectif est mentionné dans la source.</p>':''}${m.condition?`<div class="condition-note"><strong>Avant de retenir cette piste</strong><p>${esc(m.condition.text)}</p>${confirmations[m.condition.key]?`<button class="text-button" data-welding-confirm="${esc(m.condition.key)}">${esc(confirmations[m.condition.key])}</button>`:''}</div>`:''}${m.confirmedCondition?`<p class="footnote">Information client retenue : ${esc(m.confirmedCondition.text)}</p>`:''}${m.product.welding.safety.classificationCode==='1F'?'<p class="welding-risk">Produit déclaré extrêmement inflammable · voir sa FDS.</p>':''}${weldingArguments(m,openArguments)}<div class="result-links"><a href="#gaz/${esc(m.product.id)}">Fiche, formats & FDS ${icon('chevron','chevron')}</a></div></article>`).join('');
}
function weldingGuide(){
  const s=weldingJourney,step=!s.material?1:!s.process?2:!s.need?3:4;
  const material=selectionName(MATERIALS,s.material),process=selectionName(PROCESSES,s.process),need=weldingChoiceLabels[s.need]?.name||selectionName(NEEDS,s.need);
  let content='';
  if(step===1){
    const group=weldingMaterialGroups.find(g=>g.id===s.group);
    content=group?`<button class="welding-back" data-welding-edit="material">${icon('back')}Tous les métaux</button><h2 id="welding-question" tabindex="-1">${group.id==='inox'?'La nuance de l’inox est-elle connue ?':group.id==='acier'?'De quel acier s’agit-il ?':'Quel métal travaille-t-il ?'}</h2><p class="list-caption">Reprendre l’information donnée par le client.</p>${weldingChoice(group.materials.map(id=>MATERIALS.find(m=>m.id===id)),'material')}${group.id==='inox'?'':'<button class="quiet-action" data-welding-unknown>Je ne sais pas encore '+icon('chevron')+'</button>'}`:
      `<h2 id="welding-question" tabindex="-1">Quel métal travaille-t-il ?</h2><p class="list-caption">Choisir une famille de métaux.</p><ul class="welding-metal-grid">${weldingMaterialGroups.map(g=>`<li><button data-welding-group="${g.id}"><span><strong>${g.name}</strong><small>${g.detail}</small></span>${icon('chevron')}</button></li>`).join('')}</ul><button class="quiet-action" data-welding-unknown>Je ne sais pas encore ${icon('chevron')}</button>`;
  }
  else if(step===2){
    const options=availableProcesses(s.material),common=options.filter(p=>['mig','mag','tig'].includes(p.id)),other=options.filter(p=>!['mig','mag','tig'].includes(p.id));
    content=`<h2 id="welding-question" tabindex="-1">Avec quel procédé ?</h2><p class="list-caption">Reprendre le nom utilisé par le client. Un doute ? Choisir « Je ne sais pas ».</p>${weldingChoice(common.length?common:other,'process')}${common.length&&other.length?`<details class="welding-more"><summary>Autres procédés et protections ${icon('chevron')}</summary>${weldingChoice(other,'process')}</details>`:''}<button class="quiet-action" data-welding-unknown>Je ne sais pas ${icon('chevron')}</button>`;
  }
  else if(step===3)content=`<h2 id="welding-question" tabindex="-1">Quel est son besoin principal ?</h2><p class="list-caption">Choisir ce qui compte le plus pour lui.</p>${weldingChoice(['courant','finition','cadence'].map(id=>NEEDS.find(n=>n.id===id)),'need')}<details class="welding-more"><summary>Une application plus précise ${icon('chevron')}</summary>${weldingChoice(NEEDS.filter(n=>!['courant','finition','cadence'].includes(n.id)),'need')}</details>`;
  else if(s.process==='unknown'||s.material==='unknown')content=`<h2 id="welding-question" tabindex="-1">Précisons la demande</h2><div class="reading"><p>Le matériau et le procédé sont nécessaires pour établir une présélection documentée.</p><ul class="client-questions"><li>Quelle nuance ou référence matière ?</li><li>Quel poste et quel procédé le client utilise-t-il ?</li><li>Quel fil, quelle épaisseur et quelle position de soudage ?</li><li>Travail manuel, automatique ou robotisé ?</li></ul><p><a href="#gamme/arcal">Consulter les 21 fiches ARCAL</a></p></div>`;
  else {
    const result=weldingSelection(data.products,s),total=result.focused.length+result.other.length+result.conditional.length;
    content=`<h2 id="welding-question" tabindex="-1">Les pistes ARCAL</h2><p class="list-caption">${total} référence${total>1?'s':''} avec un usage publié pour ce métal et ce procédé. L’ordre de présentation n’est pas un classement de performance.</p>${s.material==='inox'?'<p class="guide-callout">La nuance inox reste à identifier. Les produits spécifiques aux inox austénitiques ou Duplex ne sont pas proposés sur ce seul libellé.</p>':''}${result.needsClarification?'<p class="guide-callout">Aucune correspondance documentée dans cette édition. Faire préciser l’application avec un technicien soudage.</p>':''}${result.focused.length?`<section><h3 class="results-label">${s.need==='courant'?'Usages documentés':'Votre objectif est documenté'}</h3>${weldingCards(result.focused,{openArguments:result.focused.length===1})}</section>`:s.need!=='courant'&&!result.needsClarification?'<p class="guide-callout">Cet objectif nécessite encore une précision. Examiner les conditions ci-dessous avant de retenir une piste.</p>':''}${result.conditional.length?`<section><h3 class="results-label">À confirmer avec le client</h3>${weldingCards(result.conditional)}</section>`:''}${result.other.length?`<details class="welding-more other-welding-results"><summary>Autres usages publiés (${result.other.length}) ${icon('chevron')}</summary><p class="list-caption">Le métal et le procédé sont cités. L’objectif choisi ou la nuance précise ne sont pas détaillés pour tous ces produits.</p>${weldingCards(result.other)}</details>`:''}<button class="quiet-action" data-welding-edit="need">Modifier le besoin ${icon('chevron')}</button>`;
  }
  const summary=s.material?`<div class="journey-summary" aria-label="Informations client, toucher pour modifier"><button data-welding-edit="material">${esc(material||'Matériau à préciser')}${icon('chevron')}</button>${s.process?`<button data-welding-edit="process">${esc(process||'Procédé à préciser')}${icon('chevron')}</button>`:''}${s.need&&s.need!=='unknown'?`<button data-welding-edit="need">${esc(need)}${icon('chevron')}</button>`:''}</div>`:'';
  $('#main').innerHTML=`<div class="welding-page">${intro('Soudage','Votre conseil ARCAL, en clientèle.')}${weldingSupport()}<div class="journey-progress"><p>${step<4?`Étape ${step} sur 3`:'Votre présélection'}</p>${s.material||s.group?'<button class="reset-journey" data-welding-reset>Nouvelle demande</button>':''}</div><ol class="welding-steps" aria-label="Parcours de sélection">${['Le métal','Le procédé','Le besoin'].map((name,i)=>`<li ${step===i+1?'aria-current="step"':''} class="${step>i+1?'is-complete':''}"><span>${i+1}</span>${name}</li>`).join('')}</ol>${summary}<section class="welding-guide">${content}</section><a class="home-link" href="#gamme/arcal">Je connais déjà le nom du gaz ${icon('chevron')}</a><p class="footnote guide-limit">Présélection issue des fiches publiques Air Liquide France consultées le 21 octobre 2026. Le choix final et les réglages nécessitent la validation du mode opératoire et la FDS du produit livré.</p><p class="catalogue-note">Guide indépendant · Aucun partenariat ni validation d’Air Liquide.</p></div>`;
  $('#welding-support')?.addEventListener('toggle',event=>{weldingSupportOpen=event.currentTarget.open;});
  nav('soudage');
}
function refreshWeldingGuide(){weldingSupportOpen=false;weldingGuide();syncTheme();window.scrollTo(0,0);$('#welding-question')?.focus({preventScroll:true});}
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
  if(t.dataset.weldingGroup){const group=weldingMaterialGroups.find(g=>g.id===t.dataset.weldingGroup);if(group){weldingJourney={group:group.id,material:group.materials.length===1?group.materials[0]:null,process:null,need:null,confirmed:[]};refreshWeldingGuide();}}
  if(t.dataset.weldingField){const field=t.dataset.weldingField;weldingJourney[field]=t.dataset.value;if(field==='material'){weldingJourney.process=null;weldingJourney.need=null;}if(field==='process')weldingJourney.need=null;weldingJourney.confirmed=[];refreshWeldingGuide();}
  if(t.hasAttribute('data-welding-reset')){weldingJourney={group:null,material:null,process:null,need:null,confirmed:[]};refreshWeldingGuide();}
  if(t.dataset.weldingEdit){const field=t.dataset.weldingEdit;weldingJourney[field]=null;if(field==='material'){weldingJourney.group=null;weldingJourney.process=null;}if(field!=='need')weldingJourney.need=null;weldingJourney.confirmed=[];refreshWeldingGuide();}
  if(t.dataset.weldingConfirm){weldingJourney.confirmed=[...new Set([...weldingJourney.confirmed,t.dataset.weldingConfirm])];refreshWeldingGuide();}
  if(t.hasAttribute('data-welding-unknown')){if(!weldingJourney.material)weldingJourney.material='unknown';weldingJourney.process='unknown';weldingJourney.need='unknown';refreshWeldingGuide();}
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
