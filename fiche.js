import {escapeHtml as esc} from './core.js';
import {iconMarkup} from './ui-icons.js';

const tabs=[['essential','Essentiel'],['safety','Sécurité'],['transport','Transport'],['technical','Technique']];
const num=n=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:4}).format(n).replace('-','−');
const icon=key=>(iconMarkup[key]||'').replace('<svg ','<svg aria-hidden="true" focusable="false" class="icon" ');
const external=(url,label)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
const paragraph=text=>`<p>${esc(text)}</p>`;
const note=text=>`<p class="footnote">${esc(text)}</p>`;
const card=(title,text)=>`<section class="consultation-card"><h2>${title}</h2>${paragraph(text)}</section>`;
const rows=items=>`<dl class="consultation-rows">${items.map(([label,value,condition])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd>${condition?`<p>${esc(condition)}</p>`:''}</div>`).join('')}</dl>`;

// Only explicitly documented states become selectable. A molecular formula
// or an ONU number alone does not establish a cylinder's physical condition.
export function sheetStates(g){
  if(g.consultation?.states?.length)return g.consultation.states;
  const transport=g.transport||[];
  const explicit=transport.length>1&&transport.every(t=>/comprimé|liquide réfrigéré/i.test(t.state));
  if(explicit)return transport.map((t,i)=>({id:String(i),label:/liquide/i.test(t.state)?'Liquide réfrigéré':'Gaz comprimé',phase:/liquide/i.test(t.state)?'liquide':'gaz',transport:t,fds:g.fds}));
  const compressed=Boolean(g.welding)||transport.some(t=>/^gaz comprimé/i.test(t.state));
  return [{id:'reference',label:compressed?'Gaz comprimé':g.kind==='product'?'Produit commercial':'Substance de référence',phase:compressed?'gaz':'reference',transport:transport[0]||null,fds:g.fds}];
}

export function riskItems(g,state){
  if(state.hazards)return state.hazards.items;
  // Visual reminders of risks already described in this entry; never inherit
  // a mixture's classification from the separate constituent entries.
  const family=g.kind==='product'?(g.welding?.safety?.flammability||''):g.family;
  const items=[];
  if(/(?:^|[·\s])(?:extrêmement\s+)?inflammable/i.test(family)&&!/ininflammable|non inflammable/i.test(family))items.push({code:'02',label:/pyrophorique/i.test(family)?'Pyrophorique · inflammable':'Inflammable'});
  if(/comburant/i.test(family))items.push({code:'03',label:'Comburant'});
  if(/corrosif/i.test(family))items.push({code:'05',label:'Corrosif'});
  if(/toxique/i.test(family))items.push({code:null,label:'Toxique'});
  if(state.phase==='gaz'&&/comprimé/i.test(state.label))items.push({code:'04',label:'Sous pression',secondary:g.welding?.safety?.classificationCode==='1A'?'Risque d’asphyxie':''});
  if(g.kind!=='product'&&(g.risks||[]).some(r=>/asphyx/i.test(r)))items.push({code:null,label:'Risque d’asphyxie'});
  return items;
}

function fdsLink(state,compact=false){
  const f=state.fds;if(!f)return note('FDS non documentée pour cette référence.');
  if(compact)return `<a class="fiche-fds-top" href="${esc(f.url)}" target="_blank" rel="noopener noreferrer" aria-label="${f.kind==='portal'?'Rechercher la FDS du produit':'Ouvrir la FDS'}${f.country?' · '+esc(f.country):''}">FDS${f.country?' · '+esc(f.country):f.kind==='portal'?icon('external'):''}</a>`;
  const label=f.kind==='portal'?'Rechercher la FDS':'Fiche de données de sécurité';
  const meta=f.reference?`${f.country==='BE'?'Benelux':'France'} · ${f.reference} · v${f.version}`:f.kind==='portal'?'Portail fournisseur · sélectionner le produit':f.kind==='manufacturer_link'?'Lien fabricant · révision à vérifier':'Document individuel · connexion nécessaire';
  return `<a class="document-action fiche-fds" href="${esc(f.url)}" target="_blank" rel="noopener noreferrer"><span>${label}<small>${esc(meta)}</small></span>${icon('external')}</a>`;
}

function hazardCard(g,state){
  const h=state.hazards,items=riskItems(g,state);
  const attention=items.some(r=>['02','03','05'].includes(r.code))||items.some(r=>/toxique/i.test(r.label));
  const words=h?.signal||'Risques documentés';
  const symbols=items.length?`<div class="consultation-risk-symbols">${items.map(r=>`<div>${r.code?`<img src="./icons/hazards/ghs${r.code}.png" alt="Pictogramme SGH${r.code} · ${esc(r.label)}" width="48" height="48">`:icon('alert')}<strong>${esc(r.label)}${r.secondary?`<span>${esc(r.secondary)}</span>`:''}</strong></div>`).join('')}</div>`:`<h2>Dangers à vérifier dans la FDS</h2>`;
  const summary=h?.summary||(g.kind==='product'?(g.welding?'Suivre les précautions du mélange et du conditionnement livré.':'Les dangers de cette référence ne sont pas détaillés dans cette édition.'):g.risks?.join(' '));
  return `<section class="consultation-risk ${attention?'risk-warm':'risk-cool'}" aria-label="Risques principaux"><p class="risk-signal">${esc(words)}</p>${symbols}${paragraph(summary||'Consulter la FDS du produit livré.')}${!h&&items.length?note('Repères des risques décrits ; étiquetage CLP exact à vérifier dans la FDS.'):''}</section>`;
}

function colourCard(g,state){
  if(state.phase==='liquide')return `<section class="consultation-colour">${paragraph(state.appearance||'Aspect du liquide non documenté dans cette édition.')}${note('Ogive de bouteille non transposée au récipient cryogénique.')}</section>`;
  const shoulder=g.shoulder;
  return `<section class="consultation-colour">${shoulder?`<p><span class="colour-swatch ral-${esc(shoulder.ral)}" aria-hidden="true"></span><strong>Ogive · ${esc(shoulder.name)} · RAL ${esc(shoulder.ral)}</strong></p>`:'<p><strong>Ogive · Non documentée</strong></p>'}${note((state.appearance?state.appearance+' · ':'')+'L’étiquette identifie le produit.')}</section>`;
}

function applications(g,state){
  const cases=state.applications||g.applicationDetails||g.welding?.uses;
  const items=cases?.length?cases.map(a=>`<li><h3>${esc(a.title)}</h3>${paragraph(a.detail||a.text)}</li>`).join(''):(g.applications||[]).map(a=>`<li>${paragraph(a)}</li>`).join('');
  const supplement=state.applications&&g.welding?`<details class="technical-details"><summary>Précisions d’utilisation du fabricant</summary><ul class="use-cases">${g.welding.uses.map(a=>`<li><h3>${esc(a.title)}</h3>${paragraph(a.detail)}</li>`).join('')}</ul>${g.welding.benefits.map(paragraph).join('')}${note('Bénéfices annoncés par le fabricant ; à qualifier pour l’application.')}</details>`:'';
  return `<section class="fiche-applications" aria-label="Applications industrielles"><h2>Utilisations</h2><ul class="consultation-applications">${items||`<li>${paragraph(g.applicationsNote||'Application précise non documentée dans cette édition.')}</li>`}</ul>${!state.applications&&g.welding?.benefits.length?`<p class="vendor-benefits">${esc(g.welding.benefits.join(' '))}</p>`:''}</section>${supplement}`;
}

function safety(g,state){
  const codes=state.hazards?.h;
  let html=hazardCard(g,state);
  if(codes)html+=`<section><h2>Dangers identifiés</h2>${rows(codes.map(h=>[h.code,h.summary,'Synthèse ; libellé complet dans la FDS.']))}</section>`;
  const s=state.safety;
  if(s)html+=card('À faire',s.do)+card('À éviter',s.avoid)+card('Stockage',s.storage);
  else {
    const precautions=g.kind==='product'?[]:g.precautions||[];
    html+=`<section class="consultation-card" role="group" aria-label="Risques & précautions"><h2>Précautions documentées</h2>${precautions.length?`<ul>${precautions.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>`:paragraph('Consulter les précautions spécifiques dans la FDS du produit livré.')}</section>`;
    if(g.welding){
      const flammable=g.welding.safety.classificationCode==='1F';
      html+=card('Manipulation',flammable?'Protéger de l’échauffement et tenir éloigné des sources d’inflammation. Suivre les consignes de la FDS.':'Risque d’asphyxie en atmosphère appauvrie en oxygène. Protéger de l’échauffement et assurer une ventilation adaptée. Suivre les consignes de la FDS.');
      if(g.welding.notes.length)html+=card('Points à confirmer',g.welding.notes.join(' '));
    }
    html+=note('Mentions H/P et classification CLP complète non détaillées ici : consulter la FDS.');
  }
  return html+note('Incident : appliquer les consignes du site et consulter la FDS. Ces repères ne constituent pas une procédure d’intervention.');
}

function transport(g,state){
  const t=state.transport;
  if(!t)return card('Transport à documenter','Numéro ONU et données ADR non vérifiés pour cette référence. Consulter la rubrique 14 de la FDS.');
  const adr=t.adrClass||g.welding?.safety?.adrClass,code=t.classificationCode||g.welding?.safety?.classificationCode;
  let html='';
  if(t.labels)html+=`<section><h2>Étiquettes ADR · Classe ${esc(adr)}</h2><div class="consultation-adr-labels">${t.labels.map(label=>`<div><img src="./icons/hazards/adr-${label.replace('.','-')}.svg" alt="Illustration ADR ${label}" width="56" height="56"><span><strong>${label}</strong><small>${label==='2.2'?'Gaz non inflammable et non toxique':'Comburant'}</small></span></div>`).join('')}</div></section>`;
  const plate=t.hazardIdentificationNumber?`<dl class="un-plate" aria-label="Numéro de danger ${esc(t.hazardIdentificationNumber)}, ONU ${esc(t.number)}"><dt>${esc(t.hazardIdentificationNumber)}</dt><dd>${esc(t.number)}</dd></dl>`:'';
  html+=`<section><h2>Identification du transport</h2><div class="consultation-transport"><div class="transport-card-heading">${plate}<div><h3>UN ${esc(t.number)}</h3>${paragraph(t.designation||t.state||state.label)}</div></div>${plate?note('Haut : n° danger · Bas : numéro ONU'):'<p class="footnote">N° danger et plaque orange non documentés pour cette référence.</p>'}</div></section>`;
  const details=[];
  if(adr&&!t.labels)details.push(['Classe ADR',adr]);
  if(code)details.push(['Classification',code,/O/.test(code)?'Lettre O, pas le chiffre zéro.':'']);
  if(t.tunnel)details.push(['Code tunnels',t.tunnel]);
  if(t.packingInstruction)details.push(['Instruction d’emballage',t.packingInstruction]);
  details.push(['Catégorie de transport',t.category==null?'Non confirmée':String(t.category),t.category==null?'À confirmer dans le Tableau A ADR applicable.':'Valeur documentaire recoupée avec BAM.']);
  if(t.packingGroup)details.push(['Groupe d’emballage',t.packingGroup,'Libellé de la FDS conservé.']);
  html+=rows(details);
  if(t.tunnel)html+=note(t.tunnel==='E'?'E : restriction des tunnels de catégorie E.':'C/E : citerne, tunnels C, D et E ; autres transports, tunnel E.');
  html+=colourCard(g,state);
  html+=note('Repères documentaires. La signalisation, les exemptions et le passage réel dépendent du transport effectué. Les illustrations ne sont pas des étiquettes à imprimer.');
  if(t.sourceUrl)html+=`<p class="footnote">${external(t.sourceUrl,'Source de la référence transport '+icon('external'))}</p>`;
  return html;
}

function physical(g,state){
  const p=g.consultation?.physical;
  if(p){
    const liquid=state.phase==='liquide',items=liquid?p.liquid:p.gas;
    let html=`<section><h2>Propriétés du ${liquid?'liquide':'gaz'}</h2><p class="section-caption">${liquid?'À 1,013 bar absolu':'15 °C · 1,013 bar absolu'}</p>${rows(items.map(x=>[x.label,x.display||`${num(x.value)} ${x.unit}`,x.conditions+(liquid&&x.label==='Masse volumique'?' · Au point d’ébullition.':'')]))}</section>`;
    html+=`<section><h2>Substance de référence</h2>${rows([['Masse molaire',`${num(g.molarMass)} g/mol`,'Valeur publiée par Air Liquide.'],...p.points.map(x=>[x.label,`${num(x.temperatureC)} °C`,`Pression : ${num(x.pressureBar)} bar absolu.`])])}</section>`;
    html+=card('Conditionnement',liquid?'Réservoir ou récipient cryogénique : capacité et pression dépendent de l’équipement livré.':'Pression, taille et chapeau dépendent de la référence commerciale sélectionnée.');
    return html+formula(g);
  }
  const molecular=g.formula!==g.elements?.[0]||g.elements?.length>1;
  const density=state.phase==='liquide'?null:g.density;
  const items=[['Masse molaire',`${num(g.molarMass)} g/mol`,'Valeur de référence de la substance.']];
  if(state.phase!=='liquide')items.push(['Masse volumique du gaz',density==null?'Non retenue¹':`${num(density)} kg/m³`,'Phase gazeuse · 15 °C · 1,013 bar absolu.']);
  if(g.transition)items.push([g.transition.kind==='sublimation'?'Sublimation':'Ébullition',`${num(g.transition.temperatureC)} °C`,'À 1,013 bar absolu.']);
  let html=`<section><h2>Propriétés de référence</h2>${rows(items)}${g.densityNote?note('¹ '+g.densityNote):''}${g.transitionNote?note(g.transitionNote):''}${state.phase==='liquide'?note('Masse volumique et propriétés spécifiques de ce liquide non détaillées dans cette édition.'):''}</section>`;
  html+=card('Conditionnement','Pression, taille, chapeau et raccord dépendent du produit commercial et de l’équipement livré. Aucune valeur générique n’est attribuée à cette substance.');
  return html+formula(g,molecular);
}

function formula(g){
  const molecular=g.formula!==g.elements?.[0]||g.elements?.length>1;
  return `<details class="technical-details"><summary>Bien lire la formule et les valeurs</summary>${paragraph(g.formulaNote||(molecular?`${g.displayFormula} est une formule moléculaire. Symboles des éléments : ${g.elements.join(', ')}.`:`${g.displayFormula} désigne un gaz monoatomique et le symbole de son élément.`))}${paragraph(g.note)}${paragraph('État de référence : '+g.phaseAtReference+' à 15 °C et 1,013 bar. Les valeurs ne décrivent pas une bouteille particulière.')}</details>`;
}

function productTechnical(g){
  const w=g.welding;
  let html;
  if(w){
    const groups=new Map();
    for(const v of w.variants){const key=[v.mode,v.size,v.pressure,v.content].join('|');if(!groups.has(key))groups.set(key,{...v,heads:[]});groups.get(key).heads.push(v.head||'Non précisé');}
    const exact=`<details class="technical-details"><summary>Voir les ${w.variants.length} références exactes</summary><ul class="supply-list">${w.variants.map(v=>`<li><h3>${esc(v.mode)} · ${esc(v.size||'Taille non précisée')}</h3>${rows([['Pression de remplissage',v.pressure||'Non précisée'],['Tête / chapeau',v.head||'Non précisé dans le tableau'],...(v.content?[['Contenu annoncé',v.content]]:[])])}<p class="supply-reference">Réf. <code>${esc(v.reference)}</code>${v.note?`<small>${esc(v.note)}</small>`:''}</p></li>`).join('')}</ul></details>`;
    html=`<section><h2>Composition</h2>${rows(w.specifications.map(s=>[s.component,s.value+(s.tolerance?' '+s.tolerance:'')]))}<p class="standard-label">${esc(w.standard)}</p></section><section id="product-supply"><h2>Formats et remplissage</h2><ul class="consultation-applications">${[...groups.values()].map(v=>`<li><h3>${v.mode==='Cadre'?'Cadre ':''}${esc(g.id==='arcal-chrome'&&v.mode==='Cadre'?v.size.replace('V09','9'):v.size||v.mode)} · ${esc(v.pressure||'Pression non précisée')}${v.content?' · '+esc(v.content):''}</h3>${paragraph((v.mode==='Cadre'?'Tête / chapeau : ':'Tête ')+[...new Set(v.heads)].join(' ou '))}</li>`).join('')}</ul>${note('L : capacité en eau. Pression publiée de remplissage, pas un réglage de soudage. Les conditions des m³ ne sont pas précisées : aucune conversion ni autonomie calculée. Stock et disponibilité à confirmer.')}${exact}<p class="footnote">${external(w.sheet.url,`Fiche fabricant V${esc(w.sheet.version)} · ${esc(w.sheet.date)} · tableau p. ${w.sheet.tablePage}`)}</p></section><section><h2>Raccords et chapeaux</h2><div class="consultation-card">${paragraph(w.connections)}</div>${note('Raccords publiés ; vérifier l’équipement de la référence livrée. Les dimensions physiques du chapeau ne sont pas publiées.')}</section><section><h2>Impuretés publiées</h2>${rows(w.impurities.map(s=>[s.component,s.value,/ppm/i.test(s.value)?'':w.impurityUnit]))}${note('Une valeur sans signe ≤ est conservée telle quelle, sans inventer une limite. H₂O (5 bar) : condition de mesure publiée.')}</section>`;
  }else html=`<section><h2>Composition publiée</h2>${rows([['Composition',g.composition,'Teneurs et tolérances à vérifier sur la référence livrée.']])}</section>${card('Conditionnement','Pression, taille, chapeau et raccord ne sont pas documentés pour cette référence dans cette édition.')}`;
  html+=`<details class="technical-details"><summary>Constituants de la référence</summary><ul class="constituent-links">${g.components.map(id=>`<li><a href="#gaz/${esc(id)}">Fiche ${esc(id.replaceAll('-',' '))} ${icon('chevron')}</a></li>`).join('')}</ul>${note('Ces fiches décrivent les constituants séparés ; leurs propriétés et dangers ne doivent pas être transposés au mélange. Les propriétés physiques du produit commercial ne sont pas calculées.')}</details>`;
  return html;
}

export function ficheMarkup(g,options={}){
  const states=sheetStates(g),state=states.find(s=>s.id===options.stateId)||states[0];
  const product=g.kind==='product',symbols=riskItems(g,state);
  const type=g.consultation?.type||(product?(g.welding?.safety?.flammability||'Dangers non détaillés'):g.family);
  const identity=product?(g.welding?.manufacturerCode||g.displayFormula):g.displayFormula;
  const subtitle=product?(g.welding?g.welding.processes.join(' · ')+' · Réf. '+g.welding.manufacturerCode:'Produit commercial · '+g.composition):g.subtitle+' · CAS '+g.cas;
  const stateSelector=states.length>1?`<div class="fiche-states" role="group" aria-label="État du produit">${states.map(s=>`<button type="button" data-fiche-state="${esc(s.id)}" aria-pressed="${s.id===state.id}">${esc(s.label)}</button>`).join('')}</div>`:`<p class="fiche-state-label">${esc(state.label)}${state.phase==='reference'&&!product?' · '+esc(g.phaseAtReference)+' à 15 °C':''}</p>`;
  const heading=`<header class="fiche-title"><span class="formula large ${identity.length>4?'compact':''}" aria-label="${product?'Référence commerciale':'Formule'} ${esc(identity)}">${esc(identity)}</span><div><h1 tabindex="-1">${esc(g.name)}</h1><p>${esc(subtitle)}</p><strong class="fiche-gas-type ${symbols.some(r=>['02','03','05'].includes(r.code))?'type-hazard':''}">${esc(type)}</strong></div></header>`;
  const nav=`<div class="fiche-tabs" role="tablist" aria-label="Rubriques de la fiche">${tabs.map(([id,label],i)=>`<button type="button" role="tab" id="tab-${id}" data-sheet-tab="${id}" aria-controls="panel-${id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${label}</button>`).join('')}</div>`;
  let essential=hazardCard(g,state)+colourCard(g,state);
  if(product)essential+=`<p class="consultation-composition">${esc(g.id==='arcal-chrome'?'CO₂ 2 % ± 0,5 % · Ar complément':g.composition)}</p>`;
  essential+=applications(g,state);
  if(g.welding)essential+=`<button type="button" class="fiche-shortcut" data-jump="product-supply"><span><strong>Formats, pression et tête</strong><small>${g.welding.variants.length} références publiées</small></span>${icon('chevron')}</button><details class="technical-details client-checklist"><summary>Préparer l’échange client</summary><ul><li>Nuance, épaisseur et préparation des pièces.</li><li>Procédé, fil, mode de transfert et position.</li><li>Objectif, consommation, mobilité et raccord disponible.</li></ul>${paragraph('Ce guide ne remplace pas une validation technique de l’application ni un DMOS.')}</details>`;
  const panels={essential,safety:safety(g,state),transport:transport(g,state),technical:product?productTechnical(g,options.technicalProduct):physical(g,state)};
  return `<article class="fiche consultation-fiche ${product?'consultation-product':''}" data-entry="${esc(g.id)}" data-state="${esc(state.id)}"><div class="topbar detail-bar"><a href="${esc(options.back||'#catalogue')}" class="back">${icon('back')}${esc(options.backLabel||'Catalogue')}</a><div class="fiche-top-actions">${fdsLink(state,true)}${options.favorite||''}</div></div>${heading}${stateSelector}${nav}${tabs.map(([id],i)=>`<div class="fiche-panel" role="tabpanel" id="panel-${id}" data-panel="${id}" aria-labelledby="tab-${id}" tabindex="0" ${i===0?'':'hidden'}>${panels[id]}${fdsLink(state)}</div>`).join('')}${(options.sources||'').replace('</details>',note(state.fds?.note||'')+(g.consultation?.sourceNote?note(g.consultation.sourceNote):'')+note('Guide indépendant, sans affiliation ni validation par Air Liquide ou l’INRS. Teinte écran indicative.')+'</details>')}${state.fds?.country==='BE'?note('Référence Benelux. FDS France du produit livré à confirmer.'):''}</article>`;
}
