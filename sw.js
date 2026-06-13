/* Swiftread service worker — offline app shell.
   Bump VERSION on every deploy that changes index.html, sw.js, or the vendored libs. */
const VERSION = 'v3';
const CACHE = 'swiftread-' + VERSION;

// Paths are relative to this file, so the same worker runs at "/" (local) and
// "/swiftread/" (GitHub Pages). CRITICAL assets MUST all cache or the install
// fails (so we never activate a half-cached, "installed but broken offline" app).
const CRITICAL = [
  './',
  'index.html',
  'vendor/pdf.min.js',
  'vendor/pdf.worker.min.js',
  'vendor/mammoth.browser.min.js',
];
// Nice-to-have; tolerated if a fetch hiccups on first load.
const OPTIONAL = [
  'manifest.webmanifest',
  'icon-32.png',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CRITICAL); // rejects (and aborts install) if any critical asset fails
    await Promise.all(OPTIONAL.map(url => cache.add(url).catch(() => {})));
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

// only store genuinely cacheable 200 responses (a 206 partial would throw in cache.put)
function cacheable(res) {
  return res && res.status === 200 && (res.type === 'basic' || res.type === 'default');
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin

  // Navigations: network-first so an online launch always gets the freshest app,
  // with the cached shell as the offline fallback.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch(req);
        if (cacheable(res)) cache.put(req, res.clone());
        return res;
      } catch {
        return (await cache.match(req, { ignoreSearch: true }))
          || (await cache.match('./'))
          || (await cache.match('index.html'))
          || new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  // Everything else (vendor libs, icons, the PDF worker): stale-while-revalidate.
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const fromNet = fetch(req).then(res => {
      if (cacheable(res)) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    e.waitUntil(fromNet);
    return cached
      || (await fromNet)
      || new Response('Offline', { status: 503, statusText: 'Offline' });
  })());
});
