// El nombre de la caché para nuestra app
const CACHE_NAME = 'tabla-del-9-cache-v1';

// Los archivos que queremos guardar en caché para que funcione offline
const FILES_TO_CACHE = [
  '/', // La carpeta raíz (carga index.html por defecto)
  'index.html', // El juego
  'manifest.json' // El manifiesto
];

// Evento 'install': Se dispara cuando el service worker se instala.
// Aquí es donde guardamos nuestros archivos en la caché.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Abriendo caché y guardando archivos');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        // Forzar al service worker 'waiting' a convertirse en 'active'
        return self.skipWaiting();
      })
  );
});

// Evento 'activate': Se dispara cuando el service worker se activa.
// Aquí limpiamos cachés antiguas si las hay.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Service Worker: Borrando caché antigua', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // Le dice al service worker que tome control de la página inmediatamente
  return self.clients.claim();
});

// Evento 'fetch': Se dispara cada vez que la página pide un recurso (un archivo, una imagen, etc.)
// Aquí decidimos si darle el archivo desde la caché (offline) o desde internet.
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching', event.request.url);
  
  // Estrategia: "Cache First" (Primero busca en caché)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si el archivo está en la caché, lo devolvemos
        if (response) {
          console.log('Service Worker: Devolviendo desde caché', event.request.url);
          return response;
        }
        
        // Si no está en la caché, vamos a internet a buscarlo
        console.log('Service Worker: Devolviendo desde red', event.request.url);
        return fetch(event.request);
      })
  );
});
