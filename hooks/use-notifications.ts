"use client"

import { useState, useEffect, useCallback } from "react"
import { useAlarmEffects } from "./use-alarm-effects"
import { websocketService, type AlarmMessage } from "@/lib/websocket-service"

export const useNotifications = () => {
  const [isReady, setIsReady] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { playAlarmEffects } = useAlarmEffects({
    enableAudio: true,
    enableVibration: true,
    intensity: "emergency",
  })

  // Initialize notifications
  const initializeNotifications = useCallback(async () => {
    console.log("🚀 Inicializando sistema de alarmas...")
    
    try {
      // Verificar permisos básicos
      if (!("Notification" in window)) {
        setError("Tu navegador no soporta notificaciones")
        return
      }

      // Conectar WebSocket
      const wsReady = await websocketService.connect()
      if (wsReady) {
        setIsConnected(true)
        setIsReady(true)
        console.log("✅ Conectado al sistema de alarmas compartidas")
      }
    } catch (error) {
      console.error("❌ Error inicializando:", error)
      setError("Error al conectar al sistema de alarmas")
    }
  }, [])

  // Habilitar notificaciones (simplificado)
  const enableNotifications = useCallback(async () => {
    console.log("🔔 Habilitando notificaciones...")
    
    try {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setIsReady(true)
        console.log("✅ Notificaciones habilitadas")
        return true
      } else {
        setError("Se necesitan permisos de notificación")
        return false
      }
    } catch (error) {
      console.error("❌ Error habilitando notificaciones:", error)
      setError("Error al habilitar notificaciones")
      return false
    }
  }, [])

  // Enviar alarma a todos los dispositivos
  const triggerAlarm = useCallback(
    async (type: "sound" | "vibrate") => {
      console.log("🚨 Activando alarma tipo:", type)

      if (!isReady) {
        setError("Debes habilitar las notificaciones primero")
        return false
      }

      try {
        // Enviar alarma a través de WebSocket
        let wsSuccess = false
        try {
          // Intentar conectar si no está conectado
          if (!websocketService.getConnectionStatus()) {
            console.log("🔌 WebSocket desconectado, intentando conectar...")
            await websocketService.connect()
          }
          
          wsSuccess = await websocketService.sendAlarm({ type })
          console.log("📡 Alarma enviada a través de WebSocket:", wsSuccess)
        } catch (error) {
          console.warn("⚠️ Error enviando alarma por WebSocket:", error)
        }

        // Reproducir efectos locales
        console.log("🚨 Activando efectos locales...")
        playAlarmEffects(type)

        console.log("✅ Alarma activada exitosamente")
        return wsSuccess || true
      } catch (error) {
        console.error("❌ Error activando alarma:", error)
        setError("Error al activar la alarma")
        return false
      }
    },
    [isReady, playAlarmEffects],
  )

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Configurar listener para mensajes WebSocket
  useEffect(() => {
    console.log("🔧 Configurando listeners WebSocket...")
    
    // Configurar listener de mensajes (SIEMPRE)
    websocketService.onMessage((message: AlarmMessage) => {
      console.log("📨 Mensaje WebSocket recibido:", message)
      
      // Ignorar mensajes propios
      if (message.senderId === websocketService.getDeviceId()) {
        console.log("🚫 Ignorando mensaje propio")
        return
      }

      // Activar alarma local con delay para evitar conflictos
      const alarmType = message.type
      console.log("🚨 Activando alarma WebSocket tipo:", alarmType)

      // Delay pequeño para evitar conflictos de audio
      setTimeout(() => {
        playAlarmEffects(alarmType)
      }, 100)

      // Show notification
      if (Notification.permission === "granted") {
        const notification = new Notification("🚨 Alarma Compartida Activada", {
          body: `Alarma de tipo ${alarmType === "sound" ? "sonido" : "vibración"} activada desde otro dispositivo`,
          icon: "/icon-192x192.png",
          tag: "shared-alarm-websocket",
          requireInteraction: true,
          silent: alarmType === "vibrate",
        })

        setTimeout(() => {
          notification.close()
        }, 10000)
      }
    })

    // Configurar listener para cambios de conexión (SIEMPRE)
    websocketService.onConnectionChange((connected: boolean) => {
      setIsConnected(connected)
      console.log("🔌 Estado de conexión WebSocket:", connected ? "Conectado" : "Desconectado")
    })

          // Iniciar polling para alarmas (cada 3 segundos)
      const pollInterval = setInterval(() => {
        // Intentar conectar si no está conectado
        if (!websocketService.getConnectionStatus()) {
          websocketService.connect()
        } else {
          websocketService.pollForAlarms()
        }
      }, 3000)

    return () => {
      clearInterval(pollInterval)
    }
  }, [playAlarmEffects])

  // Initialize on mount
  useEffect(() => {
    initializeNotifications()

    // Cleanup on unmount
    return () => {
      websocketService.cleanup()
    }
  }, [initializeNotifications])

  return {
    isReady,
    isConnected,
    error,
    enableNotifications,
    triggerAlarm,
    initializeNotifications,
    clearError,
    // Compatibility properties
    isSubscribed: isReady,
    token: isReady ? "local-token" : null,
  }
}
