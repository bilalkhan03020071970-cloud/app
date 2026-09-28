/* sw.js — Service Worker: Injects COOP/COEP headers to enable SharedArrayBuffer on GitHub Pages */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request)
            .then(response => {
                const headers = new Headers(response.headers);
                headers.set('Cross-Origin-Opener-Policy', 'same-origin');
                headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
                headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: headers,
                });
            })
            .catch(() => fetch(e.request))
    );
});
