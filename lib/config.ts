// Configuration file for development vs production
export const config = {
  // Development mode - set to false for production build
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Firebase configuration
  firebase: {
    apiKey: "AIzaSyABvmRsLlnbYZ2rqYb8LpRkx3GJgyynUN0",
    authDomain: "pdf-manager-7fbf8.firebaseapp.com",
    databaseURL: "https://pdf-manager-7fbf8-default-rtdb.firebaseio.com",
    projectId: "pdf-manager-7fbf8",
    storageBucket: "pdf-manager-7fbf8.appspot.com",
    messagingSenderId: "775859610688",
    appId: "1:775859610688:web:16f5eb9fdcda34115eeba5",
    measurementId: "G-VP3479TRHV",
  },
  
  // VAPID key for push notifications
  vapidKey: "BOavBmpF4dTY649Bj7vv5aQEDOipxAuj53OM0VlQwSTiMrdGjhqwUSUNhC2mCUhdnpsVN5S16_3frDAd-czbwT0",
  
  // API endpoints
  apiEndpoints: {
    // Development - use local Next.js API routes
    development: {
      SEND_ALARM: "/api/send-alarm",
      SUBSCRIBE: "/api/subscribe",
      UNSUBSCRIBE: "/api/unsubscribe",
    },
    // Production - use Firebase Cloud Functions
    production: {
      SEND_ALARM: "https://us-central1-pdf-manager-7fbf8.cloudfunctions.net/sendAlarmNotification",
      SUBSCRIBE: "https://us-central1-pdf-manager-7fbf8.cloudfunctions.net/subscribeToAlarm",
      UNSUBSCRIBE: "https://us-central1-pdf-manager-7fbf8.cloudfunctions.net/unsubscribeFromAlarm",
    }
  },
  
  // Get current API endpoints based on environment
  getApiEndpoints() {
    return this.isDevelopment ? this.apiEndpoints.development : this.apiEndpoints.production
  },
  
  // Service worker configuration
  serviceWorker: {
    // Primary service worker (Firebase)
    primary: "/firebase-messaging-sw.js",
    // Fallback service worker
    fallback: "/sw.js",
    // Scope for service worker
    scope: "/",
  },
  
  // App settings
  app: {
    name: "Alarma Compartida",
    shortName: "Alarma",
    description: "Sistema de alarma de emergencia compartida",
    themeColor: "#ea580c",
    backgroundColor: "#ffffff",
  },
  
  // Notification settings
  notifications: {
    defaultIcon: "/icon-192x192.png",
    defaultBadge: "/icon-192x192.png",
    defaultTag: "shared-alarm",
    requireInteraction: true,
    autoCloseDelay: 10000, // 10 seconds
  },
  
  // Vibration patterns
  vibration: {
    emergency: [500, 200, 500, 200, 500, 200, 100, 100, 100, 100, 100, 100, 500, 200, 500, 200, 500],
    alert: [300, 150, 300, 150, 300, 150, 100, 100, 100, 100, 300, 150, 300],
    gentle: [200, 100, 200, 100, 200],
  }
}

export default config
