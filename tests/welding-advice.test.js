import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {weldingSelection} from '../welding.js';
import {weldingAdvice} from '../welding-advice.js';

const {products}=JSON.parse(readFileSync(new URL('../data/gases.json',import.meta.url)));
const arcal=products.filter(product=>product.welding);
const product=id=>arcal.find(item=>item.id===id);
const matchFor=(id,journey)=>{
  const result=weldingSelection(products,journey);
  return [...result.focused,...result.other,...result.conditional].find(match=>match.product.id===id);
};

test('Les 21 argumentaires conservent les seuls bénéfices et dates de leur propre source',()=>{
  assert.equal(arcal.length,21);
  for(const item of arcal){
    const advice=weldingAdvice(item);
    const checked=item.sources.find(source=>source.url===item.sourceUrl)?.checked||'';
    assert.deepEqual(advice.benefits,item.welding.benefits.map(text=>({text,sourceUrl:item.sourceUrl,checked})));
    assert.equal(advice.sourceUrl,item.sourceUrl);
    assert.ok(advice.pitch.includes(item.name));
    assert.ok(advice.question.length>20);
    assert.deepEqual(advice.objections.map(objection=>objection.id),['prix','actuel','reprises','changement']);
    for(const objection of advice.objections){
      for(const field of ['title','response','question','next'])assert.ok(objection[field].length>15,`${item.id} ${objection.id} ${field}`);
    }
    assert.ok(advice.offer.length>=3);
    assert.ok(advice.technical.length>=3);
    assert.ok(advice.nextSteps.length>=3);
    assert.doesNotMatch(JSON.stringify(advice),/<\/?[a-z][^>]*>/i);
  }
});

test('Les produits sans bénéfice publié ne reçoivent aucune promesse empruntée',()=>{
  const ownBenefits=arcal.flatMap(item=>item.welding.benefits);
  for(const item of arcal.filter(item=>!item.welding.benefits.length)){
    const advice=weldingAdvice(item);
    assert.deepEqual(advice.benefits,[]);
    const text=JSON.stringify(advice);
    for(const benefit of ownBenefits)assert.ok(!text.includes(benefit));
    assert.match(advice.technical.join(' '),/Aucun bénéfice comparatif/);
  }
});

test('Speed conditionnel conserve le fil plein comme information à obtenir',()=>{
  const journey={material:'carbone',process:'mag',need:'cadence'};
  const match=matchFor('arcal-speed',journey);
  const advice=weldingAdvice(product('arcal-speed'),journey,match);
  assert.ok(match.condition);
  assert.match(advice.pitch,/à confirmer/);
  assert.match(advice.technical.join(' '),/À confirmer.*fil plein/);
  assert.match(advice.nextSteps[0].text,/fil plein/);
  assert.doesNotMatch(advice.technical.join(' '),/Le client a déclaré/);
});

test('Une confirmation client est distinguée de la qualification du soudage',()=>{
  const journey={material:'carbone',process:'mag',need:'cadence',confirmed:['fil-plein']};
  const match=matchFor('arcal-speed',journey);
  const advice=weldingAdvice(product('arcal-speed'),journey,match);
  assert.match(advice.technical.join(' '),/Le client a déclaré utiliser un fil plein/);
  assert.match(advice.technical.join(' '),/ne qualifie pas/);
  assert.doesNotMatch(advice.pitch,/à confirmer/);
});

test('L’accès direct ignore un contexte guidé antérieur et ne confirme aucune compatibilité',()=>{
  const stale={material:'carbone',process:'mag',need:'cadence',confirmed:['fil-plein']};
  for(const item of arcal){
    assert.deepEqual(weldingAdvice(item,stale,null),weldingAdvice(item));
  }
  const advice=weldingAdvice(product('arcal-speed'),stale,null);
  assert.match(advice.pitch,/Vérifions d’abord/);
  assert.match(advice.technical.join(' '),/Aucune compatibilité/);
  assert.match(advice.technical.join(' '),/fil plein/);
  assert.doesNotMatch(advice.technical.join(' '),/Le client a déclaré/);
});

test('Un résultat associé à un autre produit ne valide pas le contexte',()=>{
  const journey={material:'carbone',process:'mag',need:'cadence',confirmed:['fil-plein']};
  const speed=matchFor('arcal-speed',journey);
  assert.deepEqual(weldingAdvice(product('arcal-chrome'),journey,speed),weldingAdvice(product('arcal-chrome')));
});

test('Les objections ne promettent ni gains chiffrés ni maintien des réglages',()=>{
  for(const item of arcal){
    const advice=weldingAdvice(item);
    const editorial=JSON.stringify({...advice,benefits:[]});
    assert.doesNotMatch(editorial,/\d+\s*(%|€|bar|mm|m³)/);
    assert.match(advice.objections.find(item=>item.id==='prix').response,/mesurés/);
    assert.match(advice.objections.find(item=>item.id==='reprises').response,/ne suffit pas/);
    assert.match(advice.objections.find(item=>item.id==='changement').response,/réglages actuels/);
    assert.match(advice.offer.join(' '),/disponibilité.*tarif/);
  }
});

test('Les gaz déclarés extrêmement inflammables gardent un rappel technique explicite',()=>{
  for(const id of ['arcal-r1-5','arcal-r1-5-he20']){
    assert.match(weldingAdvice(product(id)).technical.join(' '),/extrêmement inflammable/);
  }
});

test('Les pitch des Référents exposent un domaine ou un intérêt propre au cas en deux phrases',()=>{
  const cases=[
    ['arcal-speed',{material:'carbone',process:'mag',need:'cadence',confirmed:['fil-plein']},/MAG acier avec fil plein/,/temps total.*reprises.*consommation/],
    ['arcal-prime',{material:'aluminium',process:'tig',need:'finition'},/faible teneur en impuretés/,/finition/],
    ['arcal-chrome',{material:'austenitique',process:'mag',need:'finition'},/projections.*finition annoncés par Air Liquide/,/reprises réelles/],
    ['arcal-force',{material:'carbone',process:'mag',need:'epais'},/pièces épaisses ou sollicitées/,/Air Liquide.*pénétration.*compacité/]
  ];
  for(const [id,journey,domain,value] of cases){
    const pitch=weldingAdvice(product(id),journey,matchFor(id,journey)).pitch;
    assert.match(pitch,domain);assert.match(pitch,value);
    assert.equal(pitch.split(/[.!?]+/).filter(text=>text.trim()).length,2,pitch);
    assert.ok(pitch.split(/\s+/).length<=70,pitch);
    assert.doesNotMatch(pitch,/Pour examiner l’intérêt/);
  }
});

test('Prime envers et Force inox ne transposent pas les avantages d’un autre domaine',()=>{
  const prime={material:'aluminium',process:'envers',need:'courant'};
  const primePitch=weldingAdvice(product('arcal-prime'),prime,matchFor('arcal-prime',prime)).pitch;
  assert.match(primePitch,/face opposée/);
  assert.doesNotMatch(primePitch,/impuretés|finition|moins/);
  const force={material:'austenitique',process:'mag',need:'courant',confirmed:['fil-fourre-inox']};
  const forcePitch=weldingAdvice(product('arcal-force'),force,matchFor('arcal-force',force)).pitch;
  assert.match(forcePitch,/inox avec fil fourré inox/);
  assert.doesNotMatch(forcePitch,/pénétration|compacité|tolérance/);
  const thin={material:'carbone',process:'mag',need:'fin'};
  assert.match(weldingAdvice(product('arcal-force'),thin,matchFor('arcal-force',thin)).pitch,/tôles fines en court-circuit/);
});

test('Les réserves de nuance et d’objectif restent dans le pitch lui-même',()=>{
  const unknown={material:'inox',process:'mag',need:'finition'};
  const chrome=weldingAdvice(product('arcal-chrome'),unknown,matchFor('arcal-chrome',unknown)).pitch;
  assert.match(chrome,/nuance inox à préciser/);
  const unproven={material:'aluminium',process:'mig',need:'cadence'};
  const prime=weldingAdvice(product('arcal-prime'),unproven,matchFor('arcal-prime',unproven)).pitch;
  assert.match(prime,/l’intérêt pour votre objectif reste à établir/i);
  const pending={material:'carbone',process:'mag',need:'finition'};
  const speed=weldingAdvice(product('arcal-speed'),pending,matchFor('arcal-speed',pending)).pitch;
  assert.match(speed,/fil plein à confirmer/);
  assert.match(speed,/l’intérêt pour votre objectif reste à établir/i);
});
