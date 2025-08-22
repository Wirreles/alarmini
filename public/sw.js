// Basic Service Worker for fallback
const CACHE_NAME = 'alarmini-v1'
const urlsToCache = [
  '/',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json'
]

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker básico instalado')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache abierto')
        return cache.addAll(urlsToCache)
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker básico activado')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})

// Handle push notifications (basic implementation)
self.addEventListener('push', (event) => {
  console.log('📨 Push notification recibida:', event)
  
  const options = {
    body: 'Alarma activada desde otro dispositivo',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'shared-alarm',
    requireInteraction: true,
    actions: [
      {
        action: 'acknowledge',
        title: 'Entendido'
      },
      {
        action: 'dismiss',
        title: 'Descartar'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('🚨 Alarma Compartida', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notificación clickeada:', event)
  
  event.notification.close()
  
  if (event.action === 'acknowledge') {
    console.log('✅ Alarma reconocida por el usuario')
  } else if (event.action === 'dismiss') {
    console.log('❌ Alarma descartada por el usuario')
  }
  
  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }
        // If app is not open, open it
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
  )
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('🚪 Notificación cerrada:', event)
})

console.log('🚀 Service Worker básico cargado correctamente')
