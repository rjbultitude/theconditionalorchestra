var CACHE_STATIC_NAME = 'static-v9f';
var CACHE_DYNAMIC_NAME = 'dynamic-v5g';

self.isOnlyIfCached = function isOnlyIfCached(event) {
  if (event.request !== undefined) {
    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
      return true;
    }
  }
}

// Install and cache app shell
self.addEventListener('install', function(event) {
  if (self.isOnlyIfCached(event)) {
      return;
  }
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function(cache) {
      console.log('[Service Worker] Precaching App Shell');
      cache.addAll([
        '/',
        'index.html',
        'https://fonts.googleapis.com/css?family=Libre+Baskerville|Lora',
      ]);
    }));
});

// Delete old cache on activation
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

// populate dynamic cache
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function(res) {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache) {
                  if (event.request.url !== '/gm-key.php') {
                    cache.put(event.request.url, res.clone());
                  }
                  return res;
                })
            })
            .catch(function(err) {
              console.log('Error fetching', err);
            });
        }
      })
  );
});
