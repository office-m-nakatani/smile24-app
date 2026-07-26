/* スマイル24 AIパートナーアプリ Service Worker
   同一オリジンのGETリクエストをキャッシュし、オフラインでもアプリ本体を開けるようにする */
var CACHE_NAME = 'smile24-app-v1';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if(url.origin !== location.origin) return;   // 外部（フォント・写真等）はキャッシュしない
  e.respondWith(
    fetch(e.request).then(function(res){
      if(res && res.ok){
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function(c){ c.put(e.request, clone); });
      }
      return res;
    }).catch(function(){
      return caches.match(e.request);   // オフライン時はキャッシュから
    })
  );
});
