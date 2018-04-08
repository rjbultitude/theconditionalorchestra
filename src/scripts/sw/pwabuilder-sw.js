self.isOnlyIfCached = function isOnlyIfCached(event) {
  if (event.request !== undefined) {
    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
      return true;
    }
  }
}

self.addEventListener('install', function(event) {
  if (self.isOnlyIfCached(event)) {
      return;
  }
  var indexPage = new Request('index.php');
  event.waitUntil(
    fetch(indexPage).then(function(response) {
      return caches.open('pwabuilder-offline').then(function(cache) {
        console.log('[PWA Builder] Cached index page during Install' + response.url);
        return cache.put(indexPage, response);
      });
  }));
});

self.addEventListener('fetch', function(event) {
  if (self.isOnlyIfCached(event)) {
    return;
  }
  var updateCache = function(request){
    return caches.open('pwabuilder-offline').then(function (cache) {
      return fetch(request).then(function (response) {
        console.log('[PWA Builder] add page to offline'+response.url);
        return cache.put(request, response);
      });
    });
  };

  event.waitUntil(updateCache(event.request));

  event.respondWith(
    fetch(event.request).catch(function(error) {
      console.log( '[PWA Builder] Network request Failed. Serving content from cache: ' + error );
      return caches.open('pwabuilder-offline').then(function (cache) {
        return cache.match(event.request).then(function (matching) {
          var report =  !matching || matching.status === 404 ? Promise.reject('no-match') : matching;
          return report;
        });
      });
    })
  );
});
