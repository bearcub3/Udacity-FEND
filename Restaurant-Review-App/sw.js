/*
 *  The location of the service worker is important!
 *  For security reasons, a service worker can only control the pages that are in its same directory or its subdirectoreis.
 *  This means that if you place the service worker file in a scripts directory it will only be able to interact with pages in the scripts directory or below
*/

 let staticCacheName = 'RestaurantReviewAppUpdate-FF0011';

 self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function(cache){
            return cache.addAll([
                // if one of the files is not present or fails to be fetched, 
                // the entire of the addAll operation fails.
                '/',
                'index.html',
                'js/main.js',
                'js/restaurant_info.js',
                'css/main.css',
                'css/styles.css'
            ]);
        })
    );
 });

 self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('RestaurantReviewAppUpdate-') &&
                   cacheName != staticCacheName;
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });

 self.addEventListener('fetch', function(event) {
    // console.log(event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response){
            return response || fetch(event.request);
        })
    );    
 });

 self.addEventListener('message', function(event) {
     if(event.data.action === 'skipWaiting') {
         self.skipWaiting();
     }
 });