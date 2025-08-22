import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

// Initialize Firebase Admin
admin.initializeApp()

interface AlarmRequest {
  type: "sound" | "vibrate"
  message?: string
}

// Cloud Function to send alarm notifications to all subscribed devices
export const sendAlarmNotification = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*")
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.set("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.status(200).send()
    return
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  try {
    const { type, message }: AlarmRequest = req.body

    if (!type || (type !== "sound" && type !== "vibrate")) {
      res.status(400).json({ error: 'Invalid alarm type. Must be "sound" or "vibrate"' })
      return
    }

    // Topic name for all alarm devices
    const topic = "shared_alarm_global"

    // Prepare notification payload
    const payload = {
      topic: topic,
      notification: {
        title: "Alarma Activada",
        body: message || `Alarma ${type === "sound" ? "sonora" : "vibratoria"} activada`,
      },
      data: {
        alarmType: type,
        timestamp: Date.now().toString(),
        action: "trigger_alarm",
      },
      android: {
        priority: "high" as const,
        notification: {
          priority: "high" as const,
          sound: type === "sound" ? "default" : undefined,
          vibrate_timings: type === "vibrate" ? ["0s", "1s", "0.5s", "1s"] : undefined,
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: "Alarma Activada",
              body: message || `Alarma ${type === "sound" ? "sonora" : "vibratoria"} activada`,
            },
            sound: type === "sound" ? "default" : undefined,
            badge: 1,
          },
        },
      },
    }

    // Send notification to topic
    const response = await admin.messaging().send(payload)

    console.log("Alarm notification sent successfully:", response)

    res.status(200).json({
      success: true,
      messageId: response,
      type: type,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Error sending alarm notification:", error)
    res.status(500).json({
      error: "Failed to send alarm notification",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Cloud Function to subscribe device to alarm topic
export const subscribeToAlarm = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*")
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.set("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.status(200).send()
    return
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  try {
    const { token } = req.body

    if (!token) {
      res.status(400).json({ error: "FCM token is required" })
      return
    }

    const topic = "shared_alarm_global"

    // Subscribe token to topic
    await admin.messaging().subscribeToTopic([token], topic)

    console.log("Device subscribed to alarm topic:", token)

    res.status(200).json({
      success: true,
      message: "Device subscribed to alarm notifications",
      topic: topic,
    })
  } catch (error) {
    console.error("Error subscribing to alarm topic:", error)
    res.status(500).json({
      error: "Failed to subscribe to alarm topic",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Cloud Function to unsubscribe device from alarm topic
export const unsubscribeFromAlarm = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*")
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.set("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.status(200).send()
    return
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  try {
    const { token } = req.body

    if (!token) {
      res.status(400).json({ error: "FCM token is required" })
      return
    }

    const topic = "shared_alarm_global"

    // Unsubscribe token from topic
    await admin.messaging().unsubscribeFromTopic([token], topic)

    console.log("Device unsubscribed from alarm topic:", token)

    res.status(200).json({
      success: true,
      message: "Device unsubscribed from alarm notifications",
      topic: topic,
    })
  } catch (error) {
    console.error("Error unsubscribing from alarm topic:", error)
    res.status(500).json({
      error: "Failed to unsubscribe from alarm topic",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
})
