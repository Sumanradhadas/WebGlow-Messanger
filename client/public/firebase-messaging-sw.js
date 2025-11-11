importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');
importScripts('/firebase-config.js');

if (self.FIREBASE_CONFIG && self.FIREBASE_CONFIG.apiKey && self.FIREBASE_CONFIG.apiKey !== 'VITE_FIREBASE_API_KEY') {
  firebase.initializeApp(self.FIREBASE_CONFIG);
} else {
  console.error('Firebase config not available or not replaced. Background messaging will not work.');
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'WebGlow Messenger';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new message',
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    tag: payload.data?.conversationId || 'message',
    data: payload.data,
    vibrate: [200, 100, 200],
    requireInteraction: false
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
