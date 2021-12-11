const staticCacheName = 'chat-v2'

const assetUrls = [
    // 'index.html',
    // '../src/App.tsx',
    '../src/index.tsx',
]

self.addEventListener('install', async e => {

    const cache = await caches.open(staticCacheName)
    await cache.addAll(assetUrls)
})


self.addEventListener('activate', e => {
    console.log('SW: activate')
})

self.addEventListener('fetch', e => {
    console.log('FETCH', e.request.url)
    e.respondWith(cacheFirst(e.request))
})


async function cacheFirst(request){
   const cached = await caches.match(request)
    return cached ?? await fetch(request)
}
