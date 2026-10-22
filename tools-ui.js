import {escapeHtml as esc,normalize,searchGases,orderGases} from './core.js';
import {iconMarkup} from './ui-icons.js';
import {GLOSSARY,GLOSSARY_SOURCES} from './glossary.js';
import {UNIT_GROUPS,gasProfiles,phaseEquivalence,convertUnits,convertGasQuantity,convertPhaseVolume} from './conversions.js';
const icon=key=>(iconMarkup[key]||'').replace('<svg ','<svg aria-hidden="true" focusable="false" class="icon" ');
const number=value=>new Intl.NumberFormat('fr-FR',{maximumSignificantDigits:6}).format(value);
const sourceLink=source=>source?.url?`<a class="tools-source" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title||'Source de la donnée')} ${icon('external')}</a><p class="tools-source-date">Consultée le ${esc(source.checked||'Date non renseignée')} · document externe en ligne</p>${source.scope?`<p class="tools-note">${esc(source.scope)}</p>`:''}`:'';
const back=(label='Outils',href='#reperes')=>`<a class="tools-back" href="${href}">${icon('back')}${label}</a>`;
export function toolsHomeMarkup(){
  return `<div class="tools-home-list"><a href="#glossaire"><span><strong>Comprendre les gaz</strong><small>Propriétés, dangers, états et unités</small></span>${icon('chevron')}</a><a href="#convertisseur"><span><strong>Convertir</strong><small>Choisir le gaz, les unités et les conditions</small></span>${icon('chevron')}</a><a href="#guide"><span><strong>À propos du guide</strong><small>Sources, installation et préférences</small></span>${icon('chevron')}</a></div><p class="tools-note">Glossaire et calculs disponibles hors ligne après mise en cache.</p>`;
}
export function glossaryListMarkup(query='',group='all'){
  const q=normalize(query),terms=GLOSSARY.filter(t=>(group==='all'||t.group===group)&&normalize([t.name,t.definition,t.example,t.attention].join(' ')).includes(q));
  if(!terms.length)return '<p class="tools-empty" role="status">Aucun terme trouvé. Essayez un autre mot ou le filtre « Tous ».</p>';
  return `<p class="tools-count" role="status">${terms.length} terme${terms.length>1?'s':''}</p>${terms.map(t=>`<details class="tools-term"><summary><span><strong>${esc(t.name)}</strong><small>${esc(t.definition)}</small></span>${icon('chevron')}</summary><div><h2>Exemple</h2><p>${esc(t.example)}</p><h2>À retenir</h2><p>${esc(t.attention)}</p>${sourceLink(GLOSSARY_SOURCES[t.sourceId])}</div></details>`).join('')}`;
}
export function glossaryMarkup(query='',group='all'){
  return `${back()}<p class="tools-intro">Un même gaz peut cumuler plusieurs propriétés. L’état physique et les dangers sont deux repères complémentaires.</p><div class="search-wrap">${icon('search')}<label class="sr-only" for="glossary-search">Chercher dans le glossaire</label><input id="glossary-search" type="search" value="${esc(query)}" placeholder="Comburant, inerte, cryogénique…" autocomplete="off"><button class="icon-button" data-glossary-clear aria-label="Effacer la recherche">${icon('close')}</button></div><div class="tools-filters" role="group" aria-label="Filtrer les termes du glossaire">${[['all','Tous'],['properties','Propriétés'],['states','États'],['units','Unités']].map(([id,label])=>`<button data-glossary-group="${id}" aria-pressed="${id===group}">${label}</button>`).join('')}</div><div id="glossary-results">${glossaryListMarkup(query,group)}</div><p class="tools-note">Synthèses pédagogiques. La classification et les consignes du produit livré restent celles de sa FDS.</p>`;
}
export const CONVERTER_DEFAULTS={gas:{from:'kg',to:'m³'},phase:{from:'L',to:'L'},pressure:{from:'bar',to:'psi'},flow:{from:'L/min',to:'m³/h'},volume:{from:'m³',to:'L'},mass:{from:'kg',to:'t'},temperature:{from:'°C',to:'°F'}};
const categories=[['gas','Masse ↔ volume du gaz'],['phase','Volume liquide ↔ gaz'],...Object.entries(UNIT_GROUPS).map(([id,g])=>[id,g.name])];
export function converterGasListMarkup(entries,query=''){
  const results=query.trim()?searchGases(entries.map(g=>({...g,aliases:[...g.aliases,g.name.replace(/[™®]/g,'')]})),query):orderGases(entries);
  if(!results.length)return '<p class="tools-empty" role="status">Aucun gaz trouvé. Essayez un nom, une formule ou une référence.</p>';
  return `<p class="tools-count" role="status">${results.length} référence${results.length>1?'s':''}${results.length>12?' · précisez la recherche pour les retrouver':''}</p><ul class="converter-gases">${results.slice(0,12).map(g=>`<li><button data-converter-entry="${esc(g.id)}"><span><strong>${esc(g.name)}</strong><small>${esc(g.kind==='product'?g.family:g.displayFormula)}${g.cas?' · CAS '+esc(g.cas):''}</small></span>${icon('chevron')}</button></li>`).join('')}</ul>`;
}
function calculation(entry,state,value=state.value){
  if(state.category==='gas')return convertGasQuantity(entry,value,state.from,state.to,state.phase);
  if(state.category==='phase')return convertPhaseVolume(entry,value,state.from,state.to,state.direction);
  return convertUnits(state.category,value,state.from,state.to);
}
export function converterOutputMarkup(entry,state){
  if(!entry)return '<p class="tools-empty">Choisissez d’abord un gaz ou une référence.</p>';
  const available=calculation(entry,state,0);
  if(!available.ok)return `<div class="tools-unavailable"><strong>Conversion indisponible</strong><p>${esc(available.error)}</p><p>Les conversions d’unités simples restent accessibles dans « Conversion ».</p></div>`;
  if(!String(state.value??'').trim())return '<p class="tools-empty">Saisissez une valeur pour obtenir le résultat.</p>';
  const result=calculation(entry,state);
  if(!result.ok)return `<p class="tools-error" role="alert">${esc(result.error)}</p>`;
  return `<div class="converter-result"><p>${result.approximate?'Résultat approché':'Résultat'}</p><output>${result.approximate?'≈ ':''}${number(result.value)} <span>${esc(result.unit)}</span></output><small>${esc(entry.name)} · ${state.category==='phase'?(state.direction==='liquide-gaz'?'liquide → gaz':'gaz → liquide'):state.category==='gas'?(state.phase==='gaz'?'phase gazeuse':'phase liquide'):'conversion d’unités'}</small></div><details class="tools-calculation"><summary>Conditions et source ${icon('chevron')}</summary><div><p>${esc(result.conditions)}</p>${result.formula?`<p>${esc(result.formula)}</p>`:''}${sourceLink(result.source)}<p class="tools-note">La précision dépend de la donnée publiée. Ce calcul ne donne pas le contenu réel ni l’autonomie d’une bouteille.</p></div></details>`;
}
const options=(units,selected)=>units.map(unit=>`<option value="${esc(unit)}" ${unit===selected?'selected':''}>${esc(unit)}</option>`).join('');
function referenceMarkup(entry,state){
  if(state.category==='gas'){
    const p=gasProfiles(entry)[state.phase];
    return p?`<p class="converter-reference"><strong>${esc(p.conditions)}</strong><span>Masse volumique : ${number(p.densityKgM3)} kg/m³</span></p>`:'<p class="converter-reference">Aucune masse volumique retenue pour cet état de cette référence.</p>';
  }
  if(state.category==='phase'){
    const p=phaseEquivalence(entry);
    return p?`<p class="converter-reference"><strong>${esc(p.conditions)}</strong><span>Équivalence publiée : ${number(p.factor)} L de gaz / L de liquide.</span></p>`:'<p class="converter-reference">Une équivalence publiée avec les deux états est nécessaire.</p>';
  }
  return `<p class="converter-reference">${state.category==='pressure'?'Le changement d’unité conserve la référence de pression, absolue ou relative.':'Le facteur de conversion de ces unités est indépendant du gaz.'}</p>`;
}
export function converterMarkup(entries,state){
  const entry=entries.find(g=>g.id===state.entryId);
  if(state.choosing||!entry)return `${back()}<h2 class="tools-section-title">Quel gaz souhaitez-vous convertir ?</h2><p class="tools-intro">Rechercher une molécule ou un produit parmi les ${entries.length} références.</p><div class="search-wrap">${icon('search')}<label class="sr-only" for="converter-search">Chercher le gaz à convertir</label><input id="converter-search" type="search" value="${esc(state.search||'')}" placeholder="Azote, O₂, argon, ARCAL…" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="icon-button" data-converter-clear-search aria-label="Effacer la recherche">${icon('close')}</button></div><div id="converter-gas-results">${converterGasListMarkup(entries,state.search||'')}</div>${entry?'<button class="tools-text" data-converter-cancel>Revenir au calcul</button>':''}`;
  const units=state.category==='gas'?['kg','g','t','L','m³','mL']:state.category==='phase'?['L','m³','mL']:Object.keys(UNIT_GROUPS[state.category]?.units||{});
  return `${back()}<div class="converter-selected"><span><strong>${esc(entry.name)}</strong><small>${esc(entry.kind==='product'?entry.family:entry.displayFormula)}</small></span><button class="tools-text" data-converter-reselect>Changer de gaz</button></div><div class="converter-form"><label for="conversion-category">Conversion</label><select id="conversion-category">${categories.map(([id,name])=>`<option value="${id}" ${id===state.category?'selected':''}>${esc(name)}</option>`).join('')}</select>${state.category==='gas'?`<label for="conversion-phase">État de la substance</label><select id="conversion-phase"><option value="gaz" ${state.phase==='gaz'?'selected':''}>Phase gazeuse</option><option value="liquide" ${state.phase==='liquide'?'selected':''}>Liquide réfrigéré</option></select>`:state.category==='phase'?`<label for="conversion-direction">Sens de conversion</label><select id="conversion-direction"><option value="liquide-gaz" ${state.direction==='liquide-gaz'?'selected':''}>Du liquide vers le gaz</option><option value="gaz-liquide" ${state.direction==='gaz-liquide'?'selected':''}>Du gaz vers le liquide</option></select>`:''}${referenceMarkup(entry,state)}<label for="conversion-value">Valeur à convertir</label><input id="conversion-value" type="text" inputmode="decimal" value="${esc(state.value||'')}" placeholder="Ex. 1,5" autocomplete="off" spellcheck="false" aria-describedby="conversion-help"><p id="conversion-help" class="tools-input-help">Virgule ou point pour les décimales.${['temperature','pressure'].includes(state.category)?' Pour une valeur négative, saisissez le nombre puis touchez ±.':''}</p>${['temperature','pressure'].includes(state.category)?'<button class="tools-text" data-converter-sign aria-label="Changer le signe de la valeur">± Changer le signe</button>':''}<div class="converter-unit-grid"><div><label for="conversion-from">De</label><select id="conversion-from">${options(units,state.from)}</select></div><div><label for="conversion-to">Vers</label><select id="conversion-to">${options(units,state.to)}</select></div></div><button class="tools-text converter-swap" data-converter-swap>Inverser les unités</button></div><div id="conversion-output" aria-live="polite" aria-atomic="true">${converterOutputMarkup(entry,state)}</div><p class="tools-note">Les conditions de référence restent fixes. Ce convertisseur ne calcule pas un changement de pression ou de température du gaz, ni une équivalence en Nm³.</p>`;
}
