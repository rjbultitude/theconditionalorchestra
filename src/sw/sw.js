/* eslint-disable no-undef, no-restricted-globals */

var CACHE_STATIC_NAME = 'static-v9j';
var CACHE_DYNAMIC_NAME = 'dynamic-v5j';

var staticCacheAssets = [
  'https://fonts.googleapis.com/css?family=Libre+Baskerville|Lora',
  'img/error-icon.svg',
  'vendor.js',
  'index.html',
  '/'
];
var dynamicCacheAssets = [
  '-icon.svg',
  '.mp3',
  'fonts.gstatic.com',
  'fonts.google.com'
];

self.isOnlyIfCached = function isOnlyIfCached(event) {
  if (event.request !== undefined) {
    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
      return true;
    }
  }
};

// Install and cache app shell
self.addEventListener('install', function install(event) {
  if (self.isOnlyIfCached(event)) {
      return;
  }
  // self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function resolve(cache) {
      console.log('[Service Worker] Precaching App Shell');
      cache.addAll(staticCacheAssets).catch(function(e) {
        console.warn('Error with', e);
      });
  }));
});

// Delete old cache on activation
self.addEventListener('activate', function activate(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function resolve(keyList) {
        return Promise.all(keyList.map(function mapCb(key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

// populate dynamic cache with selected resources
self.addEventListener('fetch', function fetchCb(event) {
  var rUrl = event.request.url;
  return dynamicCacheAssets.map(function(assetPatten) {
    if (rUrl.indexOf(assetPatten) > -1) {
      event.respondWith(
        caches.match(event.request)
          .then(function resolve(response) {
            if (response) {
              return response;
            } else {
              return fetch(event.request)
                .then(function resolve(res) {
                  return caches.open(CACHE_DYNAMIC_NAME)
                    .then(function resolve(cache) {
                      cache.put(event.request.url, res.clone());
                      return res;
                    })
                })
                .catch(function catchCb(err) {
                  console.log('Error fetching', err);
                });
            }
          })
      );
    }
  });
});

