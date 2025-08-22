importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js")

// Declare firebase variable
const firebase = self.firebase

const firebaseConfig = {
  apiKey: "AIzaSyABvmRsLlnbYZ2rqYb8LpRkx3GJgyynUN0",
  authDomain: "pdf-manager-7fbf8.firebaseapp.com",
  databaseURL: "https://pdf-manager-7fbf8-default-rtdb.firebaseio.com",
  projectId: "pdf-manager-7fbf8",
  storageBucket: "pdf-manager-7fbf8.appspot.com",
  messagingSenderId: "775859610688",
  appId: "1:775859610688:web:16f5eb9fdcda34115eeba5",
  measurementId: "G-VP3479TRHV",
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

// Enhanced vibration patterns
const VIBRATION_PATTERNS = {
  emergency: [500, 200, 500, 200, 500, 200, 100, 100, 100, 100, 100, 100, 500, 200, 500, 200, 500],
  alert: [300, 150, 300, 150, 300, 150, 100, 100, 100, 100, 300, 150, 300],
  gentle: [200, 100, 200, 100, 200],
}

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload)

  const alarmType = payload.data?.alarmType
  const notificationTitle = payload.notification?.title || "Alarma Activada"
  const notificationOptions = {
    body: payload.notification?.body || "Se ha activado una alarma de emergencia",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: "shared-alarm",
    requireInteraction: true,
    silent: alarmType === "vibrate", // Don't play default sound for vibrate-only
    actions: [
      {
        action: "acknowledge",
        title: "Entendido",
      },
      {
        action: "dismiss",
        title: "Descartar",
      },
    ],
    data: {
      ...payload.data,
      timestamp: Date.now(),
    },
  }

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions)

  // Handle vibration with enhanced patterns
  if (alarmType === "vibrate" && "vibrate" in navigator) {
    // Use emergency pattern for maximum attention
    navigator.vibrate(VIBRATION_PATTERNS.emergency)

    // Repeat vibration pattern for emphasis
    setTimeout(() => {
      if ("vibrate" in navigator) {
        navigator.vibrate(VIBRATION_PATTERNS.alert)
      }
    }, 3000)
  }

  // For sound alarms, the browser will handle the default notification sound
  // unless we set silent: true
})

// Enhanced notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event)

  event.notification.close()

  if (event.action === "acknowledge") {
    console.log("Alarm acknowledged by user")
    // Could send acknowledgment back to server here
  } else if (event.action === "dismiss") {
    console.log("Alarm dismissed by user")
    // Stop any ongoing vibrations
    if ("vibrate" in navigator) {
      navigator.vibrate(0)
    }
  }

  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus()
        }
      }
      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow("/")
      }
    }),
  )
})

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event)

  // Stop vibration when notification is closed
  if ("vibrate" in navigator) {
    navigator.vibrate(0)
  }
})
