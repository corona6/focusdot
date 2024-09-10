
const MAIN_CACHE = 'main_20240910';

self.addEventListener("install", async (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(MAIN_CACHE)
        await cache.addAll(['.'])
    })())
});
  
const cacheFirst = (event) => {

    if (event.request.method.toLowerCase() != 'get') return
    if (event.request.headers.get('Range') != null) return
    
    const requestUrl = new URL(event.request.url)
    
    if (requestUrl.protocol != 'http:' && requestUrl.protocol != 'https:') return;

    event.respondWith((async ()=>{
        const cache = await caches.open(MAIN_CACHE)

        const responsePromise = fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone())
            return response
        })

        let cacheResponse = await caches.match(event.request)

        return cacheResponse || await responsePromise
    })())
};

self.addEventListener('fetch', cacheFirst);

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