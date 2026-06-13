/* Swiftread service worker — offline app shell.
   Bump VERSION whenever the vendored libs or this file change to force a clean refresh. */
const VERSION = 'v1';
const CACHE = 'swiftread-' + VERSION;

// Everything needed to run with no network. Paths are relative to this file's
// location, so the same worker works at "/" (local) and "/swiftread/" (GitHub Pages).
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icon-32.png',
  'icon-180.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'vendor/pdf.min.js',
  'vendor/pdf.worker.min.js',
  'vendor/mammoth.browser.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // ignore individual failures (e.g. an icon not yet deployed) so install still succeeds
    await Promise.all(SHELL.map(url => cache.add(url).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const fromNet = fetch(req).then(res => {
      if (res && res.ok && (res.type === 'basic' || res.type === 'default')) {
        cache.put(req, res.clone());
      }
      return res;
    }).catch(() => null);
    // keep the SW alive long enough to finish the background cache update
    e.waitUntil(fromNet);
    // serve cache instantly when present; otherwise wait on the network;
    // last resort for a navigation is the cached app shell
    return cached
      || (await fromNet)
      || (req.mode === 'navigate' ? await cache.match('./') : null)
      || new Response('Offline', { status: 503, statusText: 'Offline' });
  })());
});
