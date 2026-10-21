/* Change VERSION for every edition; the complete app shell is cached atomically. */
const VERSION = '1.6.0';
const PREFIX = `guide-des-gaz:${self.registration.scope}:`;
const CACHE = PREFIX + VERSION;
const ASSETS = ['./','./index.html','./styles.css','./theme.js','./app.js','./core.js','./welding.js','./ui-icons.js','./icons/brand.svg','./data/gases.json','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
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
