// Custom service worker code. next-pwa bundles this file and imports it into public/sw.js.

// Push del temporizador de descanso (se envía solo cuando la app está cerrada o en segundo plano).
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Liftonic', body: event.data ? event.data.text() : '' };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Liftonic', {
      body: data.body || '',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: data.tag || 'liftonic',
      renotify: true,
      requireInteraction: data.kind === 'end',
      silent: false,
      vibrate: data.kind === 'end' ? [300, 120, 300, 120, 600] : [200, 100, 200],
      data: { url: data.url || '/dashboard/alumno' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/dashboard/alumno';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/dashboard') && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
