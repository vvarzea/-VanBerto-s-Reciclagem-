// Service worker: guarda o jogo para funcionar sem internet.
// Quando mudares o jogo, aumenta o número da versão (v1 -> v2).
const CACHE = 'reciclagem-v21';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
  './fonts/fredoka-one-latin-400-normal.woff2', './fonts/chewy-latin-400-normal.woff2',
  './fonts/nunito-latin-700-normal.woff2', './fonts/nunito-latin-800-normal.woff2', './fonts/nunito-latin-900-normal.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Mostra logo o que está guardado e atualiza em segundo plano.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const net = fetch(e.request).then(r => {
        if (r && (r.status === 200 || r.type === 'opaque')) {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return r;
      }).catch(() => hit || caches.match('./index.html'));
      return hit || net;
    })
  );
});
