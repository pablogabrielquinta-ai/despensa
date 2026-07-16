/* DPEC Foto Medidor - service worker
   Estrategia: red primero, caché de respaldo.
   Así las actualizaciones del repo llegan siempre,
   pero la app abre igual sin señal. */

var CACHE = 'dpec-foto-medidor-v3';
var ARCHIVOS = [
  './dpec_foto_medidor.html',
  './manifest.json',
  './icono-192.png',
  './icono-512.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ARCHIVOS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(claves){
      return Promise.all(claves.map(function(k){
        if(k !== CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(resp){
      // guardar copia fresca en caché
      var copia = resp.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copia); });
      return resp;
    }).catch(function(){
      // sin señal: servir desde caché
      return caches.match(e.request);
    })
  );
});
