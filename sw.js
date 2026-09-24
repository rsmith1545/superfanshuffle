/* SuperFan Shuffle service worker.

   This file was 0 bytes for a while, and both pages register it on every load.
   An empty worker costs two things that look unrelated but are the same bug:

     1. Chrome will not offer the install prompt without a fetch handler, so a
        first-time visitor on Android gets no invitation to install and has to
        find it in the browser menu.
     2. Whatever worker was installed before the file was emptied keeps
        answering for index.html and play.html, so a deploy lands on the server
        and the phone still shows last week's build.

   The shape below is chosen so that (2) can never come back:

     HTML and deck JSON are NETWORK-FIRST. A deploy always wins. The cache is
     only ever the fallback for a phone that is offline or on hotel wifi.

     Everything else - artwork, icons, fonts - is CACHE-FIRST, because those
     URLs already carry the build in a query string (see the note above
     BUILDART in play.html), so a new build is a new URL and never collides
     with the old one.

   Rules that keep a service worker from bricking a site, all enforced below:
     - only same-origin GET is touched; everything else returns undefined and
       goes to the network untouched
     - only a real 200 with a 'basic' type is ever stored, so an error page or
       an opaque cross-origin response can never be served back as the app
     - activate deletes every cache not named CACHE, so bumping CACHE is a
       full, guaranteed purge
     - every cache write is wrapped; a storage failure must never fail a fetch
*/
var CACHE   = 'sfs-2';                 /* bump to purge every client */
var OFFLINE = '/index.html';

/* Fetched on install so the game opens on a plane. Deliberately short: the
   more that is precached, the more a single 404 can break the install step. */
var PRECACHE = ['/', '/index.html', '/play.html', '/manifest.webmanifest',
                '/icon-192-v2.png', '/icon-512-v2.png'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      /* addAll is all-or-nothing - one missing file and the whole install
         fails and the old worker stays. Add them one at a time instead. */
      return Promise.all(PRECACHE.map(function(u){
        return c.add(new Request(u, {cache:'reload'}))['catch'](function(){});
      }));
    })['catch'](function(){}).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k === CACHE ? null : caches['delete'](k);
      }));
    })['catch'](function(){}).then(function(){ return self.clients.claim(); })
  );
});

/* index.html listens for controllerchange and reloads once, so a page that is
   open when a new worker takes over picks up the new build by itself. */
self.addEventListener('message', function(e){
  if(e && e.data === 'skipWaiting') self.skipWaiting();
});

/* fetch() that cannot be answered by the HTTP cache. The option is passed as
   an init override; if an engine rejects that, fall back rather than fail. */
function netFirst(req){
  try{ return fetch(req, {cache:'no-cache'}); }
  catch(err){ return fetch(req); }
}
function fresh(res){
  return res && res.status === 200 && res.type === 'basic';
}
function put(req, res){
  try{
    var copy = res.clone();
    caches.open(CACHE).then(function(c){ c.put(req, copy)['catch'](function(){}); })['catch'](function(){});
  }catch(err){}
  return res;
}

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;

  var url;
  try{ url = new URL(req.url); }catch(err){ return; }
  if(url.origin !== self.location.origin) return;      /* CDNs, analytics: untouched */

  var isHTML = req.mode === 'navigate' ||
               (req.headers.get('accept') || '').indexOf('text/html') > -1;
  var isDeck = /-decks(-\d+)?\.json$/.test(url.pathname) ||
               /\/(family-defs|manifest)\.(json|webmanifest)$/.test(url.pathname);

  if(isHTML || isDeck){
    /* NETWORK-FIRST. The deploy is the source of truth; cache is the airbag.
       'no-cache' is load-bearing, not decoration: a plain fetch() here is
       still served by the browser's own HTTP cache, and GitHub Pages sends
       HTML with a ten-minute max-age. Measured - without this the worker
       handed back the previous build while the new one sat on the server,
       which is the exact bug this file exists to kill. 'no-cache' forces a
       revalidation, so an unchanged file costs a 304 and a changed one
       arrives whole. */
    e.respondWith(
      netFirst(req).then(function(res){
        return fresh(res) ? put(req, res) : res;
      })['catch'](function(){
        /* ignoreSearch: a phone holding music-decks.json?v=6 offline should
           still get a deck when the new HTML asks for ?v=7, rather than 503. */
        return caches.match(req, {ignoreSearch:true}).then(function(hit){
          if(hit) return hit;
          if(isHTML) return caches.match(OFFLINE);
          /* A deck that is neither online nor cached: say so honestly rather
             than handing play.html a broken body it will try to parse. */
          return new Response('{}', {status:503, headers:{'Content-Type':'application/json'}});
        });
      })
    );
    return;
  }

  /* CACHE-FIRST for art and static assets - their URLs carry the build. */
  e.respondWith(
    caches.match(req).then(function(hit){
      if(hit) return hit;
      return fetch(req).then(function(res){
        return fresh(res) ? put(req, res) : res;
      })['catch'](function(){
        return new Response('', {status:504});
      });
    })
  );
});
