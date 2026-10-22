/* Change VERSION for every edition; the complete app shell is cached atomically. */
const VERSION = '2.0.1';
const PREFIX = `guide-des-gaz:${self.registration.scope}:`;
const CACHE = PREFIX + VERSION;
const ASSETS = ['./','./index.html','./styles.css','./theme.js','./app.js','./core.js','./fiche.js','./welding.js','./ui-icons.js','./icons/brand-cobalt-128.png','./icons/welding-torch.png','./icons/navigation-reference-1.7.4.png','./data/gases.json','./manifest.webmanifest','./icons/favicon-cobalt-32.png','./icons/icon-cobalt-192.png','./icons/icon-cobalt-512.png','./icons/apple-touch-cobalt-180.png','./fonts/InterVariable.woff2','./icons/hazards/ghs02.png','./icons/hazards/ghs05.png','./icons/hazards/ghs03.png','./icons/hazards/ghs04.png','./icons/hazards/adr-2-2.svg','./icons/hazards/adr-5-1.svg'];
const urls = ASSETS.map(path => new URL(path, self.registration.scope).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(urls.map(url => new Request(url,{cache:'reload'})))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if(event.data?.type==='SKIP_WAITING') self.skipWaiting();
  if(event.data?.type==='CACHE_STATUS') event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const entries=await Promise.all(urls.map(url=>cache.match(url)));
    event.ports[0]?.postMessage({ready:entries.every(Boolean),version:VERSION});
  })());
});
self.addEventListener('fetch', event => {
  const request=event.request, url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    // Only this application's shell is handled. Source websites are never cached.
    const cached=await cache.match(request,{ignoreSearch:true});
    if(cached)return cached;
    return fetch(request);
  })());
});
