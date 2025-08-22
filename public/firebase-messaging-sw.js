// Firebase Messaging Service Worker
// Este service worker maneja las notificaciones push de FCM

console.log('🔧 Firebase Messaging Service Worker cargado')

// Configuración de FCM
const FCM_CONFIG = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id",
}

// Importar Firebase Messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

// Inicializar Firebase
if (firebase.apps.length === 0) {
  firebase.initializeApp(FCM_CONFIG)
}

const messaging = firebase.messaging()

// Manejar mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Mensaje FCM recibido en background:', payload)

  const { data } = payload
  const { alarmType, timestamp, action } = data

  if (action === 'trigger_alarm') {
    console.log('🚨 Activando alarma desde background:', alarmType)
    
    // Mostrar notificación
    const notificationTitle = '🚨 Alarma Compartida Activada'
    const notificationOptions = {
      body: `Alarma de tipo ${alarmType === 'sound' ? 'sonido' : 'vibración'} activada desde otro dispositivo`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'shared-alarm-bg',
      requireInteraction: true,
      silent: alarmType === 'vibrate',
      data: {
        alarmType,
        timestamp,
        action: 'trigger_alarm'
      }
    }

    // Mostrar notificación
    self.registration.showNotification(notificationTitle, notificationOptions)

    // Activar efectos de alarma si es posible
    if (alarmType === 'vibrate' && 'vibrate' in navigator) {
      // Patrón de vibración de emergencia
      navigator.vibrate([0, 1000, 500, 1000, 500, 1000])
    }
  }
})

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notificación clickeada:', event.notification)
  
  event.notification.close()
  
  const { alarmType, action } = event.notification.data || {}
  
  if (action === 'trigger_alarm') {
    // Enfocar la ventana de la app si está abierta
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Si no hay ventanas abiertas, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
    )
  }
})

// Manejar instalación del service worker
self.addEventListener('install', (event) => {
  console.log('📱 Service Worker instalado')
  self.skipWaiting()
})

// Manejar activación del service worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activado')
  event.waitUntil(self.clients.claim())
})

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('📨 Mensaje del cliente recibido:', event.data)
  
  if (event.data && event.data.type === 'alarm') {
    const { alarmType } = event.data
    
    // Mostrar notificación local
    const notificationTitle = '🚨 Alarma Local Activada'
    const notificationOptions = {
      body: `Alarma de tipo ${alarmType === 'sound' ? 'sonido' : 'vibración'} activada`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'local-alarm',
      requireInteraction: true,
      silent: alarmType === 'vibrate'
    }
    
    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    )
  }
})

// Función para activar efectos de alarma
function triggerAlarmEffects(type) {
  if (type === 'vibrate' && 'vibrate' in navigator) {
    // Patrón de vibración de emergencia
    navigator.vibrate([0, 1000, 500, 1000, 500, 1000])
  }
  
  // Reproducir sonido de alarma
  if (type === 'sound') {
    // Crear audio context para reproducir sonido
    const audioContext = new (self.AudioContext || self.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }
}

console.log('✅ Firebase Messaging Service Worker configurado correctamente')
