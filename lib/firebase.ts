import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { firebaseConfig, FCM_CONFIG } from './firebase-config'

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Obtener instancia de messaging
export const messaging = getMessaging(app)

// Función para obtener token de FCM
export async function getFCMToken(): Promise<string | null> {
  try {
    // Verificar si el service worker está registrado
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      console.log('🔧 Service Worker registrado para FCM:', registration)
    }

    // Obtener token de FCM
    const token = await getToken(messaging, {
      vapidKey: FCM_CONFIG.vapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
    })

    if (token) {
      console.log('🔑 Token FCM obtenido:', token)
      return token
    } else {
      console.log('❌ No se pudo obtener token FCM')
      return null
    }
  } catch (error) {
    console.error('❌ Error obteniendo token FCM:', error)
    return null
  }
}

// Función para escuchar mensajes FCM en primer plano
export function onFCMMessage(callback: (payload: any) => void): () => void {
  return onMessage(messaging, (payload) => {
    console.log('📨 Mensaje FCM recibido en primer plano:', payload)
    callback(payload)
  })
}

// Función para solicitar permisos de notificación
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  try {
    const permission = await Notification.requestPermission()
    console.log('🔐 Permiso de notificación:', permission)
    return permission
  } catch (error) {
    console.error('❌ Error solicitando permisos:', error)
    return 'denied'
  }
}

// Función para verificar si las notificaciones están soportadas
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator
}

// Función para verificar si FCM está disponible
export function isFCMSupported(): boolean {
  return 'serviceWorker' in navigator && typeof messaging !== 'undefined'
}

export default app
