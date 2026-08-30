var CACHE='sfs-v240';
/* IMPORTANT: do NOT precache the HTML documents. If the app shell is cached, an installed PWA
   can launch straight from cache and bypass Cloudflare Access. Keeping only static assets here
   forces every page launch to hit the network, so the Access login is always enforced. */
var ASSETS=['/manifest.webmanifest','/icon-192.png','/icon-512.png','/apple-touch-icon.png'];
self.addEventListener('install',function(e){ e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS).catch(function(){});}).then(function(){return self.skipWaiting();})); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.map(function(k){if(k!==CACHE)return caches.delete(k);}));}).then(function(){return self.clients.claim();})); });
function cacheOk(req,res){ try{ if(res && res.ok && res.type==='basic'){ var copy=res.clone(); caches.open(CACHE).then(function(c){c.put(req,copy);}); } }catch(_){} return res; }
self.addEventListener('fetch',function(e){ var req=e.request; if(req.method!=='GET') return;
  try{ if(new URL(req.url).origin!==self.location.origin) return; }catch(_){ return; }
  /* Never intercept document navigations -> browser hits the network so Cloudflare Access can gate every launch. */
  if(req.mode==='navigate' || req.destination==='document') return;
  /* Static assets: cache-first for speed (only load once past the gate). */
  e.respondWith(caches.match(req).then(function(r){ return r || fetch(req).then(function(res){ return cacheOk(req,res); }).catch(function(){ return r; }); }));
});
