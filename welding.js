// Selection from the French supplier applications checked on 2026-10-21.
// A rule is a documented use case, never a welding-procedure qualification.
export const MATERIALS = [
  {id:'aluminium',name:'Aluminium',detail:'Aluminium et ses alliages'},
  {id:'carbone',name:'Acier carbone',detail:'Aciers non ou faiblement alliés'},
  {id:'austenitique',name:'Inox austénitique',detail:'Nuance exacte à confirmer avec le client'},
  {id:'inox',name:'Autre inox / nuance à préciser',detail:'Les mélanges spécifiques à l’austénitique restent séparés'},
  {id:'duplex',name:'Duplex / Superduplex',detail:'Applications explicitement nommées par le fabricant'},
  {id:'inox-azote',name:'Inox enrichi en azote',detail:'Inox dopés N₂'},
  {id:'cuivre',name:'Cuivre et alliages cuivreux',detail:'Le domaine dépend du procédé'},
  {id:'nickel',name:'Nickel et alliages',detail:'Dont Monel quand il est cité'},
  {id:'revetu',name:'Acier galvanisé / revêtu',detail:'Soudage ou soudo-brasage selon l’application'},
  {id:'armatures',name:'Fer à béton / treillis',detail:'Qualification de l’assemblage à préciser'}
];
export const PROCESSES = [
  {id:'mig',name:'MIG',detail:'Protection par gaz inerte'},
  {id:'mag',name:'MAG',detail:'Régime de transfert et fil à préciser'},
  {id:'tig',name:'TIG',detail:'Courant et mode de travail à préciser'},
  {id:'tig-ac',name:'TIG alternatif (AC)',detail:'Application aluminium'},
  {id:'mig-pulse',name:'MIG pulsé',detail:'Application publiée pour les alliages nickel'},
  {id:'plasma',name:'Plasma',detail:'À distinguer du gaz annulaire'},
  {id:'annulaire',name:'Gaz annulaire plasma',detail:'Protection annulaire des alliages aluminium'},
  {id:'envers',name:'Protection envers',detail:'Protection de la face opposée au soudage'},
  {id:'orbital',name:'TIG orbital',detail:'Application inox austénitique'},
  {id:'brasage-tig',name:'Soudo-brasage TIG',detail:'Application aciers galvanisés'},
  {id:'brasage-mag',name:'Brasage MAG',detail:'Fil électrode CuSi ou CuAl à préciser'},
  {id:'arc',name:'Soudage à l’arc · à préciser',detail:'La fiche M22 ne détaille pas le procédé'}
];
export const NEEDS = [
  {id:'courant',name:'Repérer les produits cités',detail:'À partir du matériau et du procédé publiés'},
  {id:'cadence',name:'Vitesse / productivité',detail:'Faire ressortir les usages qui le mentionnent'},
  {id:'finition',name:'Aspect / finition',detail:'Oxydation et opérations de finition'},
  {id:'fin',name:'Tôles fines',detail:'Seuil chiffré seulement lorsqu’il est publié'},
  {id:'epais',name:'Pièces épaisses',detail:'Aucune épaisseur limite déduite'},
  {id:'automatique',name:'Soudage automatique / robotisé',detail:'Mode de travail confirmé par le client'}
];
const metals=['aluminium','carbone','austenitique','inox','duplex','inox-azote','cuivre','nickel','revetu'];
const use=(materials,processes,why,indices,needs=[],condition=null)=>({materials,processes,why,indices,needs,condition,generalMaterial:materials===metals});
// Each index points to the original summary and supplier URL in gases.json.
export const WELDING_RULES=[
  {code:'I2013',cases:[
    use(metals,['tig','plasma'],'La fiche Prime cite le TIG et le plasma de tous les métaux.',[0],['finition']),
    use(['aluminium','cuivre'],['mig'],'Prime est cité pour le MIG de l’aluminium, du cuivre et de leurs alliages.',[1],['finition']),
    use(metals,['envers'],'Prime est référencé pour la protection envers de tous matériaux.',[2])]},
  {code:'I2531',cases:[
    use(['austenitique','inox'],['mag'],'Chrome est destiné au MAG des inox, en toutes positions, avec une attention à l’aspect et à la corrosion.',[0,1],['finition','automatique'])]},
  {code:'I2561',cases:[use(['carbone'],['mag'],'Speed vise le MAG rapide des aciers carbone avec fil plein, notamment sur lignes automatiques ou robotisées.',[0,1],['cadence','automatique'],{text:'Le domaine publié concerne le fil plein.',key:'fil-plein'})]},
  {code:'I2506',cases:[
    use(['carbone'],['mag'],'Force vise notamment les pièces en acier carbone épaisses ou mécaniquement sollicitées ; le court-circuit sur tôle fine est aussi cité.',[0,1,2],['epais','fin','automatique']),
    use(['austenitique','inox'],['mag'],'La page Force cite un emploi inox spécifiquement avec un fil fourré inox.',[2],[],{text:'Fil fourré inox adapté obligatoire pour cet usage publié.',key:'fil-fourre-inox'})]},
  {code:'I2541',cases:[use(['carbone','revetu','austenitique','inox'],['mag'],'M14 est cité pour ces aciers en MAG, avec une description centrée sur les tôles fines et les régimes pulsé / spray arc.',[0,1,2],['fin','finition','automatique'])]},
  {code:'I2576',cases:[use(['armatures'],['arc'],'M22 est référencé pour le fer à béton et les treillis ; le procédé précis n’est pas publié dans la fiche.',[0,1],[],{text:'Préciser procédé, nuance et qualification de l’assemblage.',key:'procede-armatures'})]},
  {code:'I2577',cases:[use(['carbone'],['mag'],'M23 est publié pour le MAG des aciers non ou faiblement alliés, sans détail de fil ou de régime.',[0])]},
  {code:'I2539',cases:[use(['carbone'],['mag'],'M24-7 est publié pour le MAG des aciers non ou faiblement alliés ; la tolérance CO₂ présente un écart entre sources.',[0])]},
  {code:'I2580',cases:[
    use(['aluminium','cuivre'],['mig'],'ARCAL 31 est cité pour le MIG de l’aluminium et des alliages aluminium ou cuivreux.',[0]),
    use(metals,['tig'],'ARCAL 31 est cité pour le TIG de tous matériaux, dont ceux sensibles à l’hydrogène.',[1]),
    use(['aluminium'],['annulaire'],'ARCAL 31 est cité comme gaz annulaire plasma pour les alliages aluminium.',[2])]},
  {code:'I2594',cases:[
    use(['aluminium','cuivre'],['mig'],'He20 est cité pour le MIG de l’aluminium et des alliages aluminium ou cuivreux.',[0]),
    use(metals,['tig'],'He20 est cité pour le TIG de tous matériaux, y compris ceux sensibles à l’hydrogène.',[1]),
    use(['aluminium'],['annulaire'],'He20 est cité comme gaz annulaire plasma des alliages aluminium.',[2])]},
  {code:'I2610',cases:[
    use(['duplex'],['tig','plasma'],'ARCAL 39 cite explicitement le TIG et le plasma des Duplex et Superduplex.',[0]),
    use(['inox-azote'],['tig'],'La fiche 39 cite le TIG des inox dopés en azote.',[1])]},
  {code:'I2598',cases:[use(['nickel'],['mig-pulse'],'He20µC est cité pour le MIG pulsé des alliages nickel ; le rechargement est aussi mentionné dans sa fiche.',[0,2])]},
  {code:'I2605',cases:[
    use(['aluminium'],['mig','tig'],'He70 est cité pour le TIG et le MIG automatiques des alliages aluminium.',[0],['automatique'],{text:'Application aluminium publiée en mode automatique.',key:'automatique'}),
    use(['aluminium'],['tig-ac'],'La fiche He70 cite explicitement le TIG alternatif des alliages aluminium.',[0]),
    use(['cuivre','nickel'],['tig'],'La fiche He70 cite le TIG des alliages cuivreux et de nickel, dont Monel.',[1]),
    use(['aluminium'],['annulaire'],'He70 est cité comme gaz annulaire plasma pour les alliages aluminium.',[2])]},
  {code:'I2642',cases:[use(['austenitique'],['mag'],'M11 vise les inox austénitiques, notamment tôles fines, cuverie et chaudronnerie, en MAG pulsé avec fil plein.',[0,1,2],['fin','finition','cadence','automatique'],{text:'Confirmer le régime pulsé et le fil plein uniquement.',key:'pulse-fil-plein'})]},
  {code:'I2631',cases:[use(['austenitique','inox'],['mag'],'M12 He18 cite les inox, dont les nuances ELC et les fortes épaisseurs.',[0,1,2],['epais'])]},
  {code:'I2641',cases:[use(['duplex','inox-azote','austenitique'],['mag'],'M12 He5 N cite le MAG des Duplex / Superduplex, inox enrichis en azote et inox austénitiques.',[0,1])]},
  {code:'I2651',cases:[use(['carbone'],['mag'],'M20 He5 cite le MAG des aciers non ou faiblement alliés ; aucun gain chiffré n’est détaillé.',[0])]},
  {code:'I2612',cases:[
    use(['duplex'],['tig','plasma'],'N2-2 cite explicitement le TIG et le plasma des Duplex et Superduplex.',[0]),
    use(['inox-azote'],['tig'],'N2-2 cite le TIG des inox dopés en azote.',[1])]},
  {code:'I2512',cases:[
    use(['austenitique'],['tig','plasma'],'R1-2 vise les inox austénitiques, avec une description centrée sur les faibles épaisseurs et l’aspect du cordon.',[0,1],['fin','finition','cadence','automatique']),
    use(['austenitique'],['orbital'],'R1-2 cite explicitement le TIG orbital des aciers austénitiques.',[1]),
    use(['revetu'],['brasage-tig'],'La page R1-2 cite le soudo-brasage TIG des aciers galvanisés.',[2])]},
  {code:'I2552',cases:[
    use(['austenitique','nickel'],['tig','plasma'],'R1-5 cite le TIG et le plasma des aciers austénitiques et des alliages nickel.',[0]),
    use(['austenitique'],['envers'],'R1-5 cite la protection envers des aciers austénitiques.',[2])]},
  {code:'I2521',cases:[use(['austenitique'],['tig','plasma'],'R1-5 He20 est publié pour le TIG et le plasma automatiques des aciers austénitiques.',[0],['automatique'],{text:'Le domaine publié est le soudage automatique.',key:'automatique'})]}
];

function matchingCase(rule,material,process){
  if(process==='tig-ac'&&material!=='aluminium')return undefined;
  const base=process==='tig-ac'?'tig':process;
  return rule.cases.filter(c=>c.materials.includes(material)&&(c.processes.includes(process)||c.processes.includes(base)))
    .sort((a,b)=>Number(b.processes.includes(process))-Number(a.processes.includes(process)))[0];
}
export function availableProcesses(material){
  if(!MATERIALS.some(m=>m.id===material))return [];
  return PROCESSES.filter(p=>WELDING_RULES.some(r=>matchingCase(r,material,p.id)));
}
export function weldingSelection(products,{material,process,need='courant',confirmed=[]}={}){
  const valid=MATERIALS.some(m=>m.id===material)&&PROCESSES.some(p=>p.id===process)&&NEEDS.some(n=>n.id===need);
  if(!valid)return {focused:[],other:[],conditional:[],needsClarification:true};
  const matches=WELDING_RULES.flatMap(rule=>{
    const c=matchingCase(rule,material,process),product=products.find(g=>g.welding?.manufacturerCode===rule.code);
    if(!c||!product)return [];
    const condition=(c.condition?.key==='automatique'&&need==='automatique')||confirmed.includes(c.condition?.key)?null:c.condition;
    return [{product,why:c.why,evidence:c.indices.map(i=>product.welding.uses[i]).filter(Boolean),condition,confirmedCondition:!condition?c.condition:null,specific:!c.generalMaterial,needMatch:need!=='courant'&&c.needs.includes(need)}];
  });
  const order=(a,b)=>Number(b.product.welding.category==='Référents')-Number(a.product.welding.category==='Référents')||a.product.name.localeCompare(b.product.name,'fr',{numeric:true});
  const hasSpecific=matches.some(x=>x.specific&&!x.condition);
  const focused=x=>!x.condition&&(!hasSpecific||x.specific)&&(need==='courant'||x.needMatch);
  return {focused:matches.filter(focused).sort(order),other:matches.filter(x=>!x.condition&&!focused(x)).sort(order),conditional:matches.filter(x=>x.condition).sort((a,b)=>Number(b.needMatch)-Number(a.needMatch)||order(a,b)),needsClarification:matches.length===0};
}
