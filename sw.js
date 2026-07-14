var CACHE='sfs-v9';
var ASSETS=['/','/index.html','/play.html','/manifest.webmanifest','/icon-192.png','/icon-512.png','/apple-touch-icon.png'];
self.addEventListener('install',function(e){ e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS).catch(function(){});}).then(function(){return self.skipWaiting();})); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.map(function(k){if(k!==CACHE)return caches.delete(k);}));}).then(function(){return self.clients.claim();})); });
/* Only store successful same-origin responses so a bad/blank/404 never gets cached and re-served. */
function cacheOk(req,res){ try{ if(res && res.ok && res.type==='basic'){ var copy=res.clone(); caches.open(CACHE).then(function(c){c.put(req,copy);}); } }catch(_){} return res; }
self.addEventListener('fetch',function(e){ var req=e.request; if(req.method!=='GET') return;
  try{ if(new URL(req.url).origin!==self.location.origin) return; }catch(_){ return; }
  if(req.mode==='navigate' || req.destination==='document'){
    e.respondWith(fetch(req).then(function(res){ return cacheOk(req,res); }).catch(function(){ return caches.match(req).then(function(r){ return r||caches.match('/'); }); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(r){ return r||fetch(req).then(function(res){ return cacheOk(req,res); }).catch(function(){ return caches.match('/'); }); }));
});
