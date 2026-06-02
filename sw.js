var CACHE_NAME = 'shelfcheck-v96';
var CACHE_FILES = [
  './shelfcheck_app.html',
  './manifest.json'
];

// 설치 시 캐시
self.addEventListener('install', function(e) {
  self.skipWaiting(); // 즉시 활성화
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_FILES);
    })
  );
});

// 활성화 시 이전 캐시 삭제
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim(); // 즉시 모든 클라이언트 제어
    })
  );
});

// fetch: 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', function(e) {
  // html 파일은 항상 네트워크 우선 (최신 버전 보장)
  if (e.request.url.indexOf('.html') > -1) {
    e.respondWith(
      fetch(e.request).then(function(res) {
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
        return res;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }
  // 나머지는 캐시 우선
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});
