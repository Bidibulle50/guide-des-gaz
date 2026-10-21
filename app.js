import { ESSENTIAL_IDS, catalogueSelection, readFavorites, escapeHtml as esc } from './core.js';
const $ = s => document.querySelector(s);
const paths = {
  book:'<path d="M12 5C9 3 5 3 2 4v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',back:'<path d="m15 5-7 7 7 7"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  bookmark:'<path d="M6 3h12v18l-6-4-6 4Z"/>',moon:'<path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  system:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  external:'<path d="M14 3h7v7m0-7L10 14M10 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6"/>',
  alert:'<path d="m12 3 10 18H2Z"/><path d="M12 9v5m0 3v.1"/>',
  check:'<path d="m5 12 4 4L19 6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>'
};
const icon = (key, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[key] || ''}</svg>`;
const brand = '<svg class="brand" viewBox="0 0 36 36" aria-hidden="true"><path d="m18 8-10 19h20Z" fill="none" stroke="currentColor" stroke-opacity=".22" stroke-width="3"/><circle cx="18" cy="8" r="5.5"/><circle cx="8" cy="27" r="5.5"/><circle cx="28" cy="27" r="5.5"/></svg>';
const allEntries = () => [...data.gases, ...(data.products || [])];
let data, favorites = new Set(), query = '', mode = 'essentials', catalogueScroll = 0, toastTimer, offlineReady = false, waitingWorker;
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
  $('meta[name="theme-color"]').content = dark ? '#101012' : '#f5f5f7';
  document.querySelectorAll('[data-theme-cycle]').forEach(b => { b.innerHTML = icon(theme() === 'system' ? 'system' : theme() === 'dark' ? 'moon' : 'sun'); b.setAttribute('aria-label', `Thème ${themeNames[theme()].toLowerCase()} : changer le thème`); b.title = `Thème : ${themeNames[theme()]}`; });
  const select = $('#theme-select'); if (select) select.value = theme();
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncTheme);
function toast(message) { clearTimeout(toastTimer); $('#toast').textContent=message; $('#toast').hidden=false; toastTimer=setTimeout(()=>$('#toast').hidden=true,4000); }
const formulaClass = g => g.displayFormula.length > 4 ? 'formula compact' : 'formula';
const themeButton = () => '<button class="icon-button theme-button" data-theme-cycle aria-label="Changer le thème"></button>';
function bookmark(g) { return `<button class="icon-button favorite ${favorites.has(g.id)?'is-saved':''}" data-favorite="${g.id}" aria-pressed="${favorites.has(g.id)}" aria-label="${favorites.has(g.id)?'Retirer des favoris':'Ajouter aux favoris'} : ${esc(g.name)}">${icon('bookmark')}</button>`; }
function nav(active) { $('.bottom-nav').innerHTML = `<a href="#catalogue" ${active==='catalogue'?'aria-current="page"':''}>${icon('book')}<span>Catalogue</span></a><a href="#gammes" ${active==='gammes'?'aria-current="page"':''}>${icon('search')}<span>Gammes</span></a><a href="#reperes" ${active==='reperes'?'aria-current="page"':''}>${icon('compass')}<span>Repères</span></a>`; }
function intro(title, subtitle) { return `<div class="topbar">${brand}${themeButton()}</div><header class="page-title"><h1 tabindex="-1">${title}</h1><p>${subtitle}</p></header>`; }
function catalogue() {
  $('#main').innerHTML = `${intro('Guide des gaz','Les essentiels d’abord.')}<div class="catalogue-controls"><div class="search-wrap">${icon('search')}<label class="sr-only" for="search">Rechercher un gaz ou une gamme</label><input id="search" type="search" placeholder="Nom, formule, gamme" value="${esc(query)}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="search-help list-caption"><button id="clear-search" class="icon-button" aria-label="Effacer la recherche" ${query?'':'hidden'}>${icon('close')}</button></div><div class="segmented" role="group" aria-label="Afficher les gaz"><button data-mode="essentials" aria-pressed="${mode==='essentials'}">Essentiels</button><button data-mode="all" aria-pressed="${mode==='all'}">Tous <span class="segment-count">· ${allEntries().length}</span></button><button data-mode="favorites" aria-pressed="${mode==='favorites'}">Favoris</button></div></div><div class="list-heading"><h2 id="list-title" tabindex="-1"></h2><p id="result-count" role="status"></p></div><p id="list-caption" class="list-caption"></p><p id="search-help" class="search-help" hidden></p><ul id="gas-list" class="gas-list"></ul><section id="other-gases" class="other-gases" hidden><div class="list-heading"><h2>Autres gaz & produits</h2><p>${allEntries().length-ESSENTIAL_IDS.length} fiches</p></div><p class="list-caption">Par ordre alphabétique.</p><ul id="other-gas-list" class="gas-list"></ul></section><div id="empty" class="empty" hidden></div><button id="show-all" class="catalogue-more" data-mode="all"><span><strong>Explorer les ${allEntries().length} fiches</strong><small>Gaz rares, gaz techniques et autres substances</small></span>${icon('chevron')}</button><p class="catalogue-note">Guide indépendant · Sources publiques vérifiées.<br>Pour intervenir, consultez la FDS du produit.</p>`;
  nav('catalogue'); renderList();
  $('#search').addEventListener('input', e=>{query=e.target.value;renderList();});
  $('#clear-search').addEventListener('click',()=>{query='';$('#search').value='';renderList();$('#search').focus();});
}
function gasRows(gases) {
  return gases.map(g=>`<li><a class="gas-row" href="#gaz/${g.id}"><span class="${formulaClass(g)}" aria-label="${g.kind==='product'?'Produit commercial':g.formula ? `Formule ${esc(g.formula)}` : 'Air, mélange'}">${g.displayFormula}</span><span class="gas-text"><strong>${esc(g.name)}</strong><span>${esc(g.family)}</span></span>${favorites.has(g.id)?icon('bookmark','saved-indicator'):''}${icon('chevron','chevron')}</a></li>`).join('');
}
function renderList() {
  const searching=!!query.trim();
  const result=catalogueSelection(allEntries(),query,mode,favorites);
  const grouped=mode==='all'&&!searching;
  const primary=grouped?result.filter(g=>ESSENTIAL_IDS.includes(g.id)):result;
  const other=grouped?result.filter(g=>!ESSENTIAL_IDS.includes(g.id)):[];
  $('#list-title').textContent=searching?'Résultats':mode==='favorites'?'Vos favoris':'Les principaux gaz';
  $('#result-count').textContent=searching?`${result.length} résultat${result.length!==1?'s':''}`:mode==='favorites'?`${result.length} fiche${result.length!==1?'s':''}`:`${primary.length} fiches`;
  $('#list-caption').textContent=searching?`Recherche dans les ${allEntries().length} fiches du catalogue.`:mode==='favorites'?'Les fiches que vous avez enregistrées.':'Une sélection pour l’industrie.';
  $('#clear-search').hidden=!query;
  const atomic={O:'O désigne l’élément oxygène. Le gaz de cette fiche est O₂ (saisir O2).',N:'N désigne l’élément azote. Le gaz de cette fiche est N₂ (saisir N2).',H:'H désigne l’élément hydrogène. Le gaz de cette fiche est H₂ (saisir H2).',Co:'Co est le symbole du cobalt. Pour le monoxyde de carbone, saisir CO (deux majuscules).'};
  $('#search-help').textContent=atomic[query.trim()] || '';$('#search-help').hidden=!atomic[query.trim()];
  $('#gas-list').innerHTML=gasRows(primary);$('#gas-list').hidden=!primary.length;
  $('#other-gas-list').innerHTML=gasRows(other);$('#other-gases').hidden=!other.length;
  $('#show-all').hidden=searching||mode!=='essentials';
  $('#empty').hidden=!!result.length;
  $('#empty').innerHTML=mode==='favorites'&&!searching?`${icon('bookmark')}<h2>Vos essentiels, ici.</h2><p>Ouvrez une fiche et touchez le marque-page pour la retrouver rapidement.</p><button class="text-button" data-mode="essentials">Explorer les essentiels</button>`:`${icon('search')}<h2>Aucun gaz trouvé</h2><p>Essayez un nom, O2, CO₂, LOX ou un numéro CAS. La recherche couvre les ${allEntries().length} fiches.</p><button class="text-button" data-clear>Effacer la recherche</button>`;
}
function sourceLinks(sources) { return sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${icon('external')}<span><strong>${esc(s.title)}</strong><small>${esc(s.scope)}</small></span>${icon('chevron','chevron')}</a></li>`).join(''); }
function documents(g) {
  if(!g.fds)return '';
  return `<section><h2>Identification & FDS</h2><a class="document-action" href="${esc(g.fds.url)}" target="_blank" rel="noopener noreferrer">${icon('external')}<span>${esc(g.fds.label)}<small>${g.fds.kind==='individual'?'Document individuel · connexion nécessaire':'Portail fournisseur · sélection du produit nécessaire'}</small></span></a><p class="footnote">${esc(g.fds.note)}</p><dl class="identifiers"><div><dt>Numéro ONU</dt><dd>${g.transport?.length?g.transport.map(t=>`<strong>UN ${esc(t.number)}</strong><small>${esc(t.state)}</small>`).join(''):'<small>Non vérifié pour ce produit. Consulter la rubrique 14 de sa FDS.</small>'}</dd></div><div><dt>Couleur d’ogive</dt><dd>${g.shoulder?`<span class="colour-swatch ral-${esc(g.shoulder.ral)}" aria-hidden="true"></span><strong>${esc(g.shoulder.name)} · RAL ${esc(g.shoulder.ral)}</strong><small><a href="${esc(g.shoulder.sourceUrl)}" target="_blank" rel="noopener noreferrer">Référence fabricant</a></small>`:'<small>Non documentée pour ce produit.</small>'}</dd></div></dl><p class="footnote">La couleur concerne l’ogive de la bouteille, selon le produit et le référentiel applicable (EN 1089-3 en Europe, GPL exclus). La marque n’a pas une couleur unique. L’étiquette identifie le contenu ; la teinte à l’écran reste indicative. Les références ONU ne remplacent pas les documents de transport du produit livré.</p></section>`;
}
function ranges() {
  $('#main').innerHTML=`${intro('Gammes & mélanges','Les références commerciales, clairement.')}<p class="reading range-intro">${data.products.length} références documentées dans les gammes ARCAL™, ALIGAL™, ALPHAGAZ™ et LASAL™. D’autres gammes sont répertoriées avec un accès au catalogue fabricant. Cet inventaire reste partiel.</p><ul class="gas-list range-list">${data.ranges.map(r=>`<li><a class="gas-row" href="#gamme/${r.id}"><span class="gas-text"><strong>${esc(r.name)}</strong><span>${esc(r.description)}</span><small>${data.products.filter(g=>g.range===r.id).length||'Aucune'} référence(s) documentée(s)</small></span>${icon('chevron','chevron')}</a></li>`).join('')}</ul><p class="catalogue-note">Les marques appartiennent à leur titulaire. Guide indépendant, sans affiliation avec Air Liquide.</p>`;nav('gammes');
}
function rangeDetail(r) {
  const products=data.products.filter(g=>g.range===r.id);
  $('#main').innerHTML=`<div class="topbar detail-bar"><a href="#gammes" class="back">${icon('back')}Gammes</a>${themeButton()}</div><header class="page-title"><h1 tabindex="-1">${esc(r.name)}</h1><p>${esc(r.description)}</p></header><p class="section-caption">${products.length} référence(s) documentée(s) · Catalogue France · 21 octobre 2026</p><ul class="gas-list">${gasRows(products)}</ul>${products.length?'':'<p class="reading">Les compositions de cette gamme ne sont pas encore documentées dans cette édition.</p>'}<a class="document-action" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${icon('external')}<span>Consulter le catalogue officiel<small>Source externe · connexion nécessaire</small></span></a><p class="catalogue-note">Liste partielle. Les formats, grades et mélanges sur mesure peuvent varier.</p>`;nav('gammes');
}
function productDetail(g) {
  const range=data.ranges.find(r=>r.id===g.range);
  $('#main').innerHTML=`<div class="topbar detail-bar"><a href="#gamme/${g.range}" class="back">${icon('back')}${esc(range.name)}</a>${bookmark(g)}</div><header class="gas-title"><span class="${formulaClass(g)} large">${esc(g.displayFormula)}</span><div><h1 tabindex="-1">${esc(g.name)}</h1><p>Produit commercial Air Liquide · ${esc(range.name)}</p></div></header><section><h2>Composition publiée</h2><div class="reading"><p><strong>${esc(g.composition)}</strong></p><p>Les teneurs et tolérances doivent être vérifiées pour la référence livrée. Une marque commerciale n’est pas une formule moléculaire.</p></div></section><section><h2>Applications principales</h2><ul class="applications">${g.applications.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></section>${documents(g)}<section><h2>Constituants</h2><ul class="gas-list">${gasRows(g.components.map(id=>data.gases.find(x=>x.id===id)).filter(Boolean))}</ul><p class="footnote">Ces fiches décrivent les constituants séparés ; leurs propriétés et dangers ne doivent pas être transposés au mélange. Les propriétés physiques du produit commercial ne sont pas calculées.</p></section><section><h2>Sources</h2><ul class="sources">${sourceLinks(g.sources)}</ul><a class="document-action" href="${esc(g.sourceUrl)}" target="_blank" rel="noopener noreferrer">${icon('external')}${esc(g.sourceLabel)} Air Liquide</a><p class="footnote">Consultées le 21 octobre 2026. Liens externes non enregistrés hors ligne ; certaines ressources peuvent demander une sélection, une connexion ou être temporairement indisponibles.</p></section><p class="catalogue-note">Guide indépendant. Les marques sont citées pour identifier les produits ; aucun partenariat ni validation du fabricant.</p>`;nav('gammes');
}
function detail(g) {
  if(g.kind==='product'){productDetail(g);return;}
  const molecular=g.formula!==g.elements[0] || g.elements.length>1;
  $('#main').innerHTML=`<div class="topbar detail-bar"><a href="#catalogue" class="back">${icon('back')}Catalogue</a>${bookmark(g)}</div><header class="gas-title"><span class="${formulaClass(g)} large">${g.displayFormula}</span><div><h1 tabindex="-1">${g.name}</h1><p>${g.subtitle}</p><p class="cas">CAS ${g.cas} · ${g.phaseAtReference} à 15 °C / 1,013 bar</p></div></header>${documents(g)}<section><h2>Propriétés physiques</h2><dl class="properties"><div><dt>Masse molaire<small>Valeur de référence de la substance</small></dt><dd>${fmt(g.molarMass)} <span>g/mol</span></dd></div><div><dt>Masse volumique<small>Phase gazeuse · 15 °C · 1,013 bar absolu</small></dt><dd>${g.density === null ? '<span>Non retenue¹</span>' : `${fmt(g.density)} <span>kg/m³</span>`}</dd></div><div><dt>${!g.transition?'Transition de phase':g.transition.kind==='sublimation'?'Sublimation':'Ébullition'}<small>À 1,013 bar absolu</small></dt><dd>${g.transition ? `${fmt(g.transition.temperatureC)} <span>°C</span>` : '<span>Voir note²</span>'}</dd></div></dl><p class="footnote">Valeurs de l’<a href="${g.sources[0].url}" target="_blank" rel="noopener noreferrer">Encyclopédie des gaz Air Liquide</a> ${g.id==='air' ? ' ; mélange de référence' : ' ; substance de référence'}. Elles ne décrivent pas les conditions d’une bouteille.</p>${g.densityNote?`<p class="footnote">¹ ${esc(g.densityNote)}</p>`:''}${g.transitionNote?`<p class="footnote">² ${esc(g.transitionNote)}</p>`:''}</section><section><h2>Risques & précautions</h2><div class="risk-panel">${icon('alert')}<div><h3>${g.family}</h3>${g.risks.map(x=>`<p>${esc(x)}</p>`).join('')}</div></div><ul class="precautions">${g.precautions.map(x=>`<li>${esc(x)}</li>`).join('')}<li>Adapter les précautions à l’état physique, à la température et au conditionnement réellement utilisés. Suivre la FDS et les consignes du site.</li></ul><p class="footnote">Synthèse non exhaustive ; les risques dépendent aussi de la pureté, du mélange et du conditionnement.</p></section><section><h2>Applications industrielles</h2><ul class="applications">${g.applications.length ? g.applications.map(a=>`<li>${esc(a)}</li>`).join('') : `<li>${esc(g.applicationsNote)}</li>`}</ul></section><section><h2>Bien lire la formule</h2><div class="reading"><p>${g.formulaNote ? esc(g.formulaNote) : molecular?`<strong>${g.displayFormula}</strong> est une formule moléculaire. Symboles des éléments : <strong>${g.elements.join(', ')}</strong>.`:`<strong>${g.displayFormula}</strong> désigne un gaz monoatomique et le symbole de son élément.`}</p><p>${esc(g.note)}</p></div></section><section><h2>Sources</h2><p class="section-caption">Consultées le 21 octobre 2026 · Liens externes, connexion nécessaire.</p><ul class="sources">${sourceLinks(g.sources)}</ul></section><p class="catalogue-note">Guide indépendant, sans affiliation ni validation par Air Liquide ou l’INRS.</p>`;
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
    const g=allEntries().find(g=>g.id===route.slice(5));
    if(g) {detail(g);document.title=`${g.name} · Guide des gaz`;}
    else {$('#main').innerHTML=`${intro('Fiche introuvable','Ce gaz ne figure pas dans cette édition.')}<a class="text-button" href="#catalogue">Ouvrir le catalogue</a>`;nav('catalogue');}
  } else if(route==='#gammes') {ranges();document.title='Gammes · Guide des gaz';}
  else if(route.startsWith('#gamme/')) {const r=data.ranges.find(r=>r.id===route.slice(7));if(r)rangeDetail(r);else ranges();document.title=(r?.name||'Gammes')+' · Guide des gaz';}
  else if(route==='#reperes') {reperes();document.title='Repères · Guide des gaz';}
  else {catalogue();document.title='Guide des gaz';}
  syncTheme();
  if(lastRoute) $('h1')?.focus({preventScroll:true});
  window.scrollTo(0,route==='#catalogue'?catalogueScroll:0);lastRoute=route;
}
document.addEventListener('click', e=> {
  const t=e.target.closest('button,a');if(!t)return;
  if(t.matches('[data-theme-cycle]')) {const options=['system','light','dark'];applyTheme(options[(options.indexOf(theme())+1)%3]);toast(`Thème : ${themeNames[theme()]}`);}
  if(t.dataset.mode) {mode=t.dataset.mode;query='';$('#search').value='';document.querySelectorAll('.segmented [data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));renderList();}
  if(t.hasAttribute('data-clear')) {query='';$('#search').value='';renderList();$('#search').focus();}
  if(t.dataset.favorite) {
    const id=t.dataset.favorite;favorites.has(id)?favorites.delete(id):favorites.add(id);
    let saved=true;try {localStorage.setItem('guide-gaz-favorites',JSON.stringify([...favorites]));}catch{saved=false;}
    const g=allEntries().find(g=>g.id===id);t.outerHTML=bookmark(g);$('[data-favorite]')?.focus({preventScroll:true});toast(saved?(favorites.has(id)?'Ajouté aux favoris':'Retiré des favoris'):'Favori conservé pour cette session seulement.');
  }
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
