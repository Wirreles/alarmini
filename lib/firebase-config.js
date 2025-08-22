// Firebase configuration for the mobile app
export const firebaseConfig = {
  // IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id",
}

// API endpoints for the deployed functions
// IMPORTANTE: Reemplaza con las URLs reales de tus Cloud Functions desplegadas
export const API_ENDPOINTS = {
  SEND_ALARM: "https://tu-region-tu-proyecto.cloudfunctions.net/sendAlarmNotification",
  SUBSCRIBE: "https://tu-region-tu-proyecto.cloudfunctions.net/subscribeToAlarm",
  UNSUBSCRIBE: "https://tu-region-tu-proyecto.cloudfunctions.net/unsubscribeFromAlarm",
}

// Configuración de FCM
export const FCM_CONFIG = {
  vapidKey: "tu-vapid-key-aqui", // Para notificaciones web push
  topic: "shared_alarm_global", // Tópico para todas las alarmas
}
