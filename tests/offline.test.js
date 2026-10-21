import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const script=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const scope='https://example.test/guide-des-gaz/';
function harness(failInstall=false){
  const handlers={},stores=new Map(),prefix=`guide-des-gaz:${scope}:`;
  const key=(r,ignore=false)=>{const u=new URL(typeof r==='string'?r:r.url);if(ignore)u.search='';return u.href;};
  const caches={open:async name=>{if(!stores.has(name))stores.set(name,new Map());const s=stores.get(name);return {
    addAll:async requests=>{if(failInstall)throw Error('missing asset');for(const r of requests)s.set(key(r),new Response('cached '+key(r)));},
    match:async(r,opts={})=>s.get(key(r,opts.ignoreSearch))?.clone()
  };},keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name)};
  const context=vm.createContext({URL,Request,Response,caches,fetch:async()=>{throw Error('offline');},self:{registration:{scope},location:{origin:new URL(scope).origin},addEventListener:(n,f)=>handlers[n]=f,clients:{claim:async()=>{}},skipWaiting:()=>{context.skipped=true;}}});
  vm.runInContext(script,context);
  const emit=async(name,fields={})=>{const waits=[];let response;handlers[name]({...fields,waitUntil:p=>waits.push(p),respondWith:p=>response=p});await Promise.all(waits);return response?await response:undefined;};
  return {emit,stores,prefix,context};
}
test('Cache complet dans le sous-chemin Pages ; ressources utilisables sans réseau',async()=>{
  const h=harness();await h.emit('install');await h.emit('activate');
  const keys=[...h.stores.values()][0].keys();
  for(const url of keys){const path=new URL(url).pathname.replace('/guide-des-gaz/','')||'index.html';assert.ok(existsSync(new URL('../'+path,import.meta.url)));assert.ok((await h.emit('fetch',{request:new Request(url)})).ok);}
  assert.ok((await h.emit('fetch',{request:new Request(scope+'?installed=1')})).ok);
  let status;await h.emit('message',{data:{type:'CACHE_STATUS'},ports:[{postMessage:v=>status=v}]});assert.equal(status.ready,true);
  [...h.stores.values()][0].delete(scope+'data/gases.json');
  await h.emit('message',{data:{type:'CACHE_STATUS'},ports:[{postMessage:v=>status=v}]});assert.equal(status.ready,false);
});
test('Installation incomplète refusée ; caches étrangers et sources externes préservés',async()=>{
  const failed=harness(true);await assert.rejects(failed.emit('install'),/missing asset/);
  const h=harness();h.stores.set(h.prefix+'old',new Map());h.stores.set('other-app',new Map());h.stores.set('guide-des-gaz:https://example.test/autre/:old',new Map());await h.emit('install');await h.emit('activate');
  assert.equal(h.stores.has(h.prefix+'old'),false);assert.equal(h.stores.has('other-app'),true);assert.equal(h.stores.size,3);
  assert.equal(await h.emit('fetch',{request:new Request('https://encyclopedia.airliquide.com/fr/air')}),undefined);
  assert.equal(await h.emit('fetch',{request:new Request(scope,{method:'POST'})}),undefined);
  assert.equal(h.context.skipped,undefined);await h.emit('message',{data:{type:'SKIP_WAITING'}});assert.equal(h.context.skipped,true);
});
test('Manifest : portée relative et icônes réelles',()=>{
  const m=JSON.parse(readFileSync(new URL('../manifest.webmanifest',import.meta.url)));assert.equal(m.scope,'./');assert.equal(m.start_url,'./');assert.equal(m.display,'standalone');assert.equal(m.lang,'fr');
  for(const i of m.icons){const b=readFileSync(new URL('../'+i.src,import.meta.url));assert.equal(b.subarray(1,4).toString(),'PNG');assert.equal(`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`,i.sizes);}
});
