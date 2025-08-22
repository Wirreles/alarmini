import { initializeApp, getApps } from "firebase/app"
import { getMessaging, getToken, onMessage, type MessagePayload } from "firebase/messaging"
import { config } from "./config"

// Initialize Firebase with centralized config
const app = getApps().length === 0 ? initializeApp(config.firebase) : getApps()[0]

// Firebase Cloud Messaging
let messaging: any = null
if (typeof window !== "undefined") {
  messaging = getMessaging(app)
}

export { messaging }

// Use centralized API endpoints
export const API_ENDPOINTS = config.getApiEndpoints()

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    console.log("🔔 Iniciando solicitud de permisos de notificación...")

    if (!messaging) {
      console.error("❌ Firebase messaging no está inicializado")
      return null
    }

    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.error("❌ Este navegador no soporta notificaciones")
      return null
    }

    console.log("📱 Estado actual de permisos:", Notification.permission)

    const permission = await Notification.requestPermission()
    console.log("📱 Resultado de solicitud de permisos:", permission)

    if (permission === "granted") {
      console.log("✅ Permisos de notificación otorgados, obteniendo token FCM...")

      console.log("🔑 Usando VAPID key:", config.vapidKey.substring(0, 20) + "...")

      const token = await getToken(messaging, {
        vapidKey: config.vapidKey,
      })

      if (token) {
        console.log("✅ Token FCM obtenido exitosamente:", token.substring(0, 20) + "...")
        return token
      } else {
        console.error("❌ No se pudo obtener el token FCM")
        return null
      }
    } else {
      console.log("❌ Permisos de notificación denegados:", permission)
      return null
    }
  } catch (error) {
    console.error("❌ Error obteniendo permisos de notificación:", error)
    return null
  }
}

// Subscribe device to alarm topic
export const subscribeToAlarmTopic = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINTS.SUBSCRIBE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })

    const result = await response.json()

    if (result.success) {
      console.log("✅ Dispositivo suscrito exitosamente al tema de alarmas")
      return true
    } else {
      console.error("❌ Error suscribiendo al tema de alarmas:", result.error)
      return false
    }
  } catch (error) {
    console.error("❌ Error suscribiendo al tema de alarmas:", error)
    return false
  }
}

// Send alarm notification to all devices
export const sendAlarmNotification = async (type: "sound" | "vibrate"): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINTS.SEND_ALARM, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        message: `Alarma ${type === "sound" ? "sonora" : "vibratoria"} activada`,
      }),
    })

    const result = await response.json()

    if (result.success) {
      console.log("✅ Notificación de alarma enviada exitosamente:", result.messageId)
      return true
    } else {
      console.error("❌ Error enviando notificación de alarma:", result.error)
      return false
    }
  } catch (error) {
    console.error("❌ Error enviando notificación de alarma:", error)
    return false
  }
}

// Listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) return

    onMessage(messaging, (payload: MessagePayload) => {
      console.log("📨 Mensaje en primer plano recibido:", payload)
      resolve(payload)
    })
  })
}
