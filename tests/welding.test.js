import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MATERIALS,PROCESSES,NEEDS,WELDING_RULES,availableProcesses,weldingSelection} from '../welding.js';
const {products}=JSON.parse(readFileSync(new URL('../data/gases.json',import.meta.url)));
const codes=items=>items.map(x=>x.product.welding.manufacturerCode).sort();
const pick=(material,process,need='courant',confirmed=[])=>weldingSelection(products,{material,process,need,confirmed});
test('Aluminium MIG : Prime, 31 et He20 publiés ; He70 demande le mode automatique',()=>{
  const r=pick('aluminium','mig');assert.deepEqual(codes(r.focused),['I2013','I2580','I2594']);
  assert.deepEqual(codes(r.conditional),['I2605']);assert.equal(r.conditional[0].condition.key,'automatique');
  assert.equal(r.focused[0].product.id,'arcal-prime');
  const auto=pick('aluminium','mig','automatique');assert.deepEqual(codes(auto.focused),['I2605']);assert.equal(auto.conditional.length,0);
  const confirmed=pick('aluminium','mig','courant',['automatique']);assert.ok(codes(confirmed.focused).includes('I2605'));
});
test('TIG alternatif : He70 est explicitement publié ; ce choix ne s’étend pas aux autres métaux',()=>{
  const r=pick('aluminium','tig-ac');assert.deepEqual(codes(r.focused),['I2605']);assert.equal(r.conditional.length,0);
  assert.ok(!availableProcesses('carbone').some(p=>p.id==='tig-ac'));
  assert.equal(pick('carbone','tig-ac').needsClarification,true);
});
test('Duplex : usages spécifiques avant les références tous matériaux, sans mélange à hydrogène',()=>{
  const r=pick('duplex','tig');assert.deepEqual(codes(r.focused),['I2610','I2612']);assert.deepEqual(codes(r.other),['I2013','I2580','I2594']);
  assert.equal(r.conditional.length,0);assert.deepEqual(codes(pick('duplex','mag').focused),['I2641']);
  for(const p of PROCESSES){const r=pick('duplex',p.id);assert.ok(![...r.focused,...r.other,...r.conditional].some(x=>['I2642','I2512','I2552','I2521'].includes(x.product.welding.manufacturerCode)));}
});
test('Inox non identifié : les destinations austénitiques spécifiques restent exclues',()=>{
  for(const p of PROCESSES){const r=pick('inox',p.id);assert.ok(![...r.focused,...r.other,...r.conditional].some(x=>['I2642','I2512','I2552','I2521','I2641'].includes(x.product.welding.manufacturerCode)));}
});
test('Cadence acier carbone : Speed conserve la condition fil plein jusqu’à confirmation explicite',()=>{
  const r=pick('carbone','mag','cadence');assert.equal(r.focused.length,0);
  assert.ok(r.conditional.some(x=>x.product.welding.manufacturerCode==='I2561'&&x.condition.key==='fil-plein'));
  const c=pick('carbone','mag','cadence',['fil-plein']);assert.deepEqual(codes(c.focused),['I2561']);
  assert.deepEqual(codes(pick('carbone','mag','epais').focused),['I2506']);
});
test('Les 21 produits disposent de règles traçables ; les besoins non publiés n’inventent pas de recommandation',()=>{
  assert.equal(WELDING_RULES.length,21);assert.equal(new Set(WELDING_RULES.map(r=>r.code)).size,21);
  for(const r of WELDING_RULES){
    const g=products.find(g=>g.welding?.manufacturerCode===r.code);assert.ok(g);
    for(const c of r.cases){assert.ok(c.materials.every(id=>MATERIALS.some(m=>m.id===id)));assert.ok(c.processes.every(id=>PROCESSES.some(p=>p.id===id)));assert.ok(c.needs.every(id=>NEEDS.some(n=>n.id===id)));assert.ok(c.indices.length);for(const i of c.indices)assert.equal(g.welding.uses[i].sourceUrl,g.sourceUrl);}
  }
  const r=pick('aluminium','mig','cadence');assert.equal(r.focused.length,0);assert.equal(r.other.length,3);
  for(const query of [{},{material:'inconnu',process:'tig'},{material:'aluminium',process:'unknown'},{material:'aluminium',process:'mig',need:'gain garanti'}]){
    const r=weldingSelection(products,query);assert.equal(r.needsClarification,true);assert.equal(r.focused.length+r.other.length+r.conditional.length,0);
  }
});
