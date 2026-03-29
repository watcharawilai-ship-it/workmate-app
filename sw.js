const CACHE_NAME = 'workmate-v1';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});

// Handle scheduled reminders via postMessage
self.addEventListener('message', e => {
  if (e.data.type === 'SCHEDULE_REMINDER') {
    const { taskId, taskName, taskTime, delayMs } = e.data;
    setTimeout(() => {
      self.registration.showNotification('⏰ WorkMate — แจ้งเตือนงาน', {
        body: `"${taskName}" กำหนดเวลา ${taskTime} น.`,
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: 'reminder-' + taskId,
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [{ action: 'open', title: 'เปิดแอป' }, { action: 'dismiss', title: 'รับทราบ' }]
      });
    }, delayMs);
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action !== 'dismiss') {
    e.waitUntil(clients.openWindow('./index.html'));
  }
});
