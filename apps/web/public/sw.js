// v2: cache-first yerine navigation/HTML istekleri için network-first stratejisine geçildi.
// Eskiden HER istek (HTML dahil) cache-first'ti — bu yüzden bir deploy sonrası kullanıcılar
// SW'nin cache'lediği eski sayfayı süresiz görmeye devam ediyordu (network hiç denenmiyordu).
// Artık: HTML/navigasyon istekleri her zaman ağdan denenir (çevrimdışıyken cache'e düşer),
// sadece hash'li statik dosyalar (_next/static/..) cache-first kalır çünkü onlar içerik
// değişince zaten yeni bir dosya adı alır, eskisini cache'lemek hiçbir zaman sorun olmaz.
const CACHE_NAME = 'pazaryeri-v2';
const CORE_ASSETS = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const isStaticAsset = request.url.includes('/_next/static/');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request)),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request)),
  );
});
