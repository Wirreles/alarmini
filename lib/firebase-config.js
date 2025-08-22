// Firebase configuration for the mobile app
export const firebaseConfig = {
  // These values will be provided when setting up Firebase project
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
}

// API endpoints for the deployed functions
export const API_ENDPOINTS = {
  SEND_ALARM: "https://your-region-your-project.cloudfunctions.net/sendAlarmNotification",
  SUBSCRIBE: "https://your-region-your-project.cloudfunctions.net/subscribeToAlarm",
  UNSUBSCRIBE: "https://your-region-your-project.cloudfunctions.net/unsubscribeFromAlarm",
}
