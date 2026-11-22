// 版を変えたら VERSION を上げる
const VERSION = 'v7';
const CACHE = 'visited-' + VERSION;
const FILES = ['./', 'index.html', 'countries.js', 'world.json', 'cities.json', 'vendor/d3.min.js', 'vendor/topojson-client.min.js',
  'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: 'reload'})))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

// 保存したコピーを先に出す（圏外でもすぐ開く）
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit ||
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => req.mode === 'navigate' ? caches.match('index.html') : Response.error())
  ));
});
