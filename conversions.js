// Local unit arithmetic. Gas properties are never inferred from a formula or
// from the constituents of a commercial mixture.
export const CONVERSION_SOURCE={title:'NIST · Facteurs de conversion',url:'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors',checked:'2026-10-22'};
export const UNIT_GROUPS={
  pressure:{name:'Pression',units:{bar:100000,mbar:100,kPa:1000,MPa:1000000,Pa:1,psi:6894.757293168}},
  flow:{name:'Débit',units:{'L/min':.06,'m³/h':1,'L/h':.001,'m³/s':3600}},
  volume:{name:'Volume',units:{L:.001,'m³':1,mL:.000001}},
  mass:{name:'Masse',units:{kg:1,g:.001,t:1000}},
  temperature:{name:'Température',units:{'°C':1,'°F':1,K:1}}
};
const fail=error=>({ok:false,error});
const positive=n=>Number.isFinite(n)&&n>0;
export function parseQuantity(value){
  if(typeof value==='number')return Number.isFinite(value)?value:null;
  if(typeof value!=='string')return null;
  const trimmed=value.trim();if(!trimmed)return null;
  // Spaces may separate complete groups of three digits, never arbitrary digits.
  if(/[ \u00a0\u202f]/.test(trimmed)&&!/^[-+]?\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:[.,]\d+)?$/.test(trimmed))return null;
  const plain=trimmed.replace(/[ \u00a0\u202f]/g,'');
  if(!/^[-+]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][-+]?\d+)?$/.test(plain))return null;
  const n=Number(plain.replace(',','.'));return Number.isFinite(n)?n:null;
}
export function convertUnits(category,input,from,to){
  const value=parseQuantity(input),group=UNIT_GROUPS[category];
  if(value===null)return fail('Saisissez une valeur numérique valide.');
  if(!group||!Object.hasOwn(group.units,from)||!Object.hasOwn(group.units,to))return fail('Ces unités ne correspondent pas à la même grandeur.');
  let result;
  if(category==='temperature'){
    let kelvin=from==='K'?value:from==='°C'?value+273.15:(value-32)*5/9+273.15;
    if(kelvin< -1e-10)return fail('La température ne peut pas être inférieure au zéro absolu.');
    kelvin=Math.max(0,kelvin);result=to==='K'?kelvin:to==='°C'?kelvin-273.15:(kelvin-273.15)*9/5+32;
    if(Math.abs(result)<1e-10)result=0;
  }else result=value*group.units[from]/group.units[to];
  if(!Number.isFinite(result))return fail('Cette valeur est trop grande pour être convertie.');
  return {ok:true,value:result,unit:to,source:CONVERSION_SOURCE,approximate:false,conditions:category==='pressure'?'Le changement d’unité conserve la référence de pression : absolue ou relative.':'Conversion d’unités indépendante du gaz sélectionné.'};
}
export function gasProfiles(entry){
  if(!entry||entry.kind==='product')return {};
  const profiles={},source=entry.sources?.find(s=>s.id==='encyclopedie')||entry.sources?.[0];
  if(!source?.url?.startsWith('https://')||!/^\d{4}-\d{2}-\d{2}$/.test(source.checked||''))return profiles;
  const r=entry.densityReference;
  if(positive(entry.density)&&r?.phase==='gaz'&&Number.isFinite(r.temperatureC)&&positive(r.pressureBar)){
    profiles.gaz={id:'gaz',name:'Phase gazeuse',densityKgM3:entry.density,temperatureC:r.temperatureC,pressureBar:r.pressureBar,conditions:`Gaz à ${String(r.temperatureC).replace('.',',')} °C et ${String(r.pressureBar).replace('.',',')} bar absolu`,source};
  }
  // Only the two existing, source-checked liquid datasets have this contract.
  const physical=entry.consultation?.physical;
  if(['azote','oxygene'].includes(entry.id)&&physical?.liquid){
    const rho=physical.liquid.find(p=>p.label==='Masse volumique'&&p.unit==='kg/m³');
    const boiling=physical.liquid.find(p=>p.label==='Ébullition'&&p.unit==='°C');
    if(positive(rho?.value)&&Number.isFinite(boiling?.value)&&/1,013 bar/.test(rho.conditions||'')&&/1,013 bar/.test(boiling.conditions||'')){
      profiles.liquide={id:'liquide',name:'Liquide réfrigéré',densityKgM3:rho.value,temperatureC:boiling.value,pressureBar:1.013,conditions:`Liquide au point d’ébullition (${String(boiling.value).replace('.',',')} °C) à 1,013 bar absolu`,source};
    }
  }
  return profiles;
}
export function phaseEquivalence(entry){
  const p=gasProfiles(entry),factor=entry?.consultation?.physical?.liquid?.find(x=>x.label==='Équivalent liquide → gaz'&&x.unit==='L de gaz / L de liquide');
  if(!p.gaz||!p.liquide||!positive(factor?.value)||typeof factor.conditions!=='string'||!factor.conditions.trim())return null;
  return {factor:factor.value,conditions:factor.conditions,source:p.gaz.source,gas:p.gaz,liquid:p.liquide};
}
export function convertGasQuantity(entry,input,from,to,phase='gaz'){
  const value=parseQuantity(input),profile=gasProfiles(entry)[phase];
  if(value===null||value<0)return fail('Saisissez une quantité positive ou nulle.');
  if(!profile)return fail(entry?.kind==='product'?'Masse volumique du produit commercial non documentée. Aucun calcul à partir des constituants.':'Masse volumique et conditions de référence non documentées pour cet état.');
  const volume=UNIT_GROUPS.volume.units,mass=UNIT_GROUPS.mass.units;
  if((!Object.hasOwn(volume,from)&&!Object.hasOwn(mass,from))||(!Object.hasOwn(volume,to)&&!Object.hasOwn(mass,to)))return fail('Choisissez une unité de masse ou de volume.');
  const kg=Object.hasOwn(mass,from)?value*mass[from]:value*volume[from]*profile.densityKgM3;
  const result=Object.hasOwn(mass,to)?kg/mass[to]:kg/profile.densityKgM3/volume[to];
  if(!Number.isFinite(result))return fail('Cette valeur est trop grande pour être convertie.');
  return {ok:true,value:result,unit:to,conditions:profile.conditions,profile,source:profile.source,approximate:true,formula:`Masse = volume × masse volumique (${profile.densityKgM3} kg/m³).`};
}
export function convertPhaseVolume(entry,input,from,to,direction='liquide-gaz'){
  const value=parseQuantity(input),p=phaseEquivalence(entry),units=UNIT_GROUPS.volume.units;
  if(value===null||value<0)return fail('Saisissez un volume positif ou nul.');
  if(!p)return fail('Équivalence liquide / gaz non documentée avec ses conditions pour cette référence.');
  if(!['liquide-gaz','gaz-liquide'].includes(direction)||!Object.hasOwn(units,from)||!Object.hasOwn(units,to))return fail('Choisissez les deux états et des unités de volume.');
  const result=value*units[from]*(direction==='liquide-gaz'?p.factor:1/p.factor)/units[to];
  if(!Number.isFinite(result))return fail('Cette valeur est trop grande pour être convertie.');
  return {ok:true,value:result,unit:to,conditions:p.conditions,source:p.source,approximate:true,factor:p.factor,formula:`Facteur publié : ${p.factor} L de gaz / L de liquide. Utilisé directement, séparément des masses volumiques.`};
}
