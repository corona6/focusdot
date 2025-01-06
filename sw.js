
const MAIN_CACHE = 'main_20250106';

self.addEventListener("install", async (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(MAIN_CACHE)
        await cache.addAll([
            '.',
            './favicon.ico',
            './index.html',
            './manifest.webmanifest',
            './icons/icon_64.png',
            './icons/icon_180.png',
            './icons/icon_256.png',
            './icons/icon_512.png'
        ])
    })())
});

const deleteCache = async (key) => {
    await caches.delete(key);
};

const deleteOldCaches = async () => {
    const cacheKeepList = [MAIN_CACHE];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
    await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener("activate", (event) => {
    event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', function(event) {
    if (event.request.headers.get('range')) {
        var pos =
        Number(/^bytes\=(\d+)\-$/g.exec(event.request.headers.get('range'))[1]);
        event.respondWith(
            caches.open(MAIN_CACHE)
            .then(function(cache) {
                return cache.match(event.request.url);
            }).then(function(res) {
                if (!res) {
                    return fetch(event.request)
                    .then(res => {
                        return res.arrayBuffer();
                    });
                }
                return res.arrayBuffer();
            }).then(function(ab) {
                return new Response(
                ab.slice(pos),
                {
                    status: 206,
                    statusText: 'Partial Content',
                    headers: [
                    ['Content-Range', 'bytes ' + pos + '-' +
                        (ab.byteLength - 1) + '/' + ab.byteLength]]
                });
        }));
    } else {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(function(response) {
                    return response;
                }).catch(function(error) {
                    throw error;
                });
            })
        );
    }
});