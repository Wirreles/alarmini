"use client"

import { useState, useEffect, useCallback } from "react"
import { useAlarmEffects } from "./use-alarm-effects"
import { websocketService, type AlarmMessage } from "@/lib/websocket-service"

interface NotificationState {
  permission: NotificationPermission | null
  isReady: boolean
  isSupported: boolean
  error: string | null
}

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    permission: null,
    isReady: false,
    isSupported: false,
    error: null,
  })

  const [isInitializing, setIsInitializing] = useState(true)
  const [isEnabling, setIsEnabling] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const { playAlarmEffects } = useAlarmEffects({
    enableAudio: true,
    enableVibration: true,
    intensity: "emergency",
  })

  // Check if notifications are supported
  const checkSupport = useCallback(() => {
    console.log("🔍 Verificando soporte de notificaciones...")

    const hasNotification = "Notification" in window
    const hasBroadcastChannel = "BroadcastChannel" in window
    const hasLocalStorage = typeof Storage !== "undefined"
    const hasServiceWorker = "serviceWorker" in navigator

    console.log("📱 Soporte de Notification:", hasNotification)
    console.log("📡 Soporte de BroadcastChannel:", hasBroadcastChannel)
    console.log("💾 Soporte de LocalStorage:", hasLocalStorage)
    console.log("🔧 Soporte de Service Worker:", hasServiceWorker)

    const isSupported = hasNotification && hasBroadcastChannel && hasLocalStorage && hasServiceWorker

    console.log("✅ Soporte completo:", isSupported)
    setState((prev) => ({ ...prev, isSupported }))
    return isSupported
  }, [])

  // Initialize notifications
  const initializeNotifications = useCallback(async () => {
    console.log("🚀 Inicializando sistema de notificaciones...")
    setIsInitializing(true)
    setState((prev) => ({ ...prev, error: null }))

    try {
      // Check support first
      if (!checkSupport()) {
        const errorMsg = "Tu navegador no soporta las funciones necesarias para las notificaciones"
        console.error("❌", errorMsg)
        setState((prev) => ({ ...prev, error: errorMsg }))
        return
      }

      // Get current permission status
      const permission = Notification.permission
      console.log("🔐 Estado actual de permisos:", permission)

      setState((prev) => ({
        ...prev,
        permission,
        isReady: permission === "granted",
      }))

      // Set up broadcast channel for cross-tab communication
      if (permission === "granted") {
        setupBroadcastChannel()
        
        // Inicializar servicio WebSocket
        try {
          const wsReady = await websocketService.connect()
          if (wsReady) {
            setIsConnected(true)
            console.log("✅ Conectado al sistema de alarmas compartidas")
          }
        } catch (error) {
          console.warn("⚠️ WebSocket no disponible, usando modo local:", error)
        }
      }
    } catch (error) {
      console.error("❌ Error inicializando notificaciones:", error)
      setState((prev) => ({
        ...prev,
        error: "Error al inicializar el sistema de notificaciones",
      }))
    } finally {
      setIsInitializing(false)
      console.log("🏁 Inicialización completada")
    }
  }, [checkSupport])

  // Set up broadcast channel for cross-tab communication
  const setupBroadcastChannel = useCallback(() => {
    console.log("📡 Configurando canal de comunicación...")

    try {
      const channel = new BroadcastChannel("shared-alarm")

      channel.addEventListener("message", (event) => {
        console.log("📨 Mensaje recibido de otra pestaña:", event.data)

        if (event.data.type === "alarm") {
          const alarmType = event.data.alarmType as "sound" | "vibrate"
          console.log("🚨 Activando alarma tipo:", alarmType)

          // Play alarm effects
          if (alarmType === "sound") {
            playAlarmEffects("sound")
          } else if (alarmType === "vibrate") {
            playAlarmEffects("vibrate")
          } else {
            playAlarmEffects("both")
          }

          // Show notification
          if (Notification.permission === "granted") {
            const notification = new Notification("🚨 Alarma Compartida Activada", {
              body: `Alarma de tipo ${alarmType === "sound" ? "sonido" : "vibración"} activada desde otra pestaña`,
              icon: "/icon-192x192.png",
              tag: "shared-alarm",
              requireInteraction: true,
              silent: alarmType === "vibrate",
            })

            // Auto-close after 10 seconds
            setTimeout(() => {
              notification.close()
            }, 10000)
          }
        }
      })

      // Store channel reference for cleanup
      ;(window as any).alarmChannel = channel
      console.log("✅ Canal de comunicación configurado")
    } catch (error) {
      console.error("❌ Error configurando canal de comunicación:", error)
    }
  }, [playAlarmEffects])

  // Request permission and enable notifications
  const enableNotifications = useCallback(async () => {
    console.log("🔔 Habilitando notificaciones...")

    if (!state.isSupported) {
      console.error("❌ Navegador no soportado")
      return false
    }

    setIsEnabling(true)
    setState((prev) => ({ ...prev, error: null }))

    try {
      // Request permission
      console.log("🙏 Solicitando permisos...")
      const permission = await Notification.requestPermission()
      console.log("📱 Resultado de permisos:", permission)

      if (permission !== "granted") {
        const errorMsg = "Se necesitan permisos de notificación para usar la aplicación"
        console.error("❌", errorMsg)
        setState((prev) => ({
          ...prev,
          permission,
          error: errorMsg,
        }))
        return false
      }

      // Set up broadcast channel
      setupBroadcastChannel()

      // Inicializar servicio WebSocket
      try {
        const wsReady = await websocketService.connect()
        if (wsReady) {
          setIsConnected(true)
          console.log("✅ Conectado al sistema de alarmas compartidas")
        }
      } catch (error) {
        console.warn("⚠️ WebSocket no disponible, usando modo local:", error)
      }

      // Save permission status
      localStorage.setItem("alarm-app-permission", "granted")

      setState((prev) => ({
        ...prev,
        permission: "granted",
        isReady: true,
        error: null,
      }))

      console.log("🎉 Notificaciones habilitadas exitosamente")
      return true
    } catch (error) {
      console.error("❌ Error habilitando notificaciones:", error)
      setState((prev) => ({
        ...prev,
        error: "Error al habilitar las notificaciones",
      }))
      return false
    } finally {
      setIsEnabling(false)
    }
  }, [state.isSupported, setupBroadcastChannel])

  // Send alarm to all connected tabs/devices
  const triggerAlarm = useCallback(
    async (type: "sound" | "vibrate") => {
      console.log("🚨 Activando alarma tipo:", type)

      if (!state.isReady) {
        const errorMsg = "Debes habilitar las notificaciones primero"
        console.error("❌", errorMsg)
        setState((prev) => ({ ...prev, error: errorMsg }))
        return false
      }

      try {
        // Enviar alarma a través de WebSocket (SIEMPRE intentar)
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
          console.warn("⚠️ Error enviando alarma por WebSocket, usando modo local:", error)
        }

        // Send to other tabs via BroadcastChannel (fallback local)
        const channel = (window as any).alarmChannel
        if (channel) {
          console.log("📡 Enviando alarma a otras pestañas...")
          channel.postMessage({
            type: "alarm",
            alarmType: type,
            timestamp: Date.now(),
          })
        }

        // Save to localStorage for persistence
        localStorage.setItem(
          "last-alarm",
          JSON.stringify({
            type,
            timestamp: Date.now(),
          }),
        )

        // Trigger local alarm effects
        console.log("🚨 Activando efectos locales...")
        if (type === "sound") {
          playAlarmEffects("sound")
        } else {
          playAlarmEffects("vibrate")
        }

        // Show local notification
        if (Notification.permission === "granted") {
          const notification = new Notification("🚨 Alarma Activada", {
            body: `Has activado una alarma de ${type === "sound" ? "sonido" : "vibración"}`,
            icon: "/icon-192x192.png",
            tag: "shared-alarm-local",
            requireInteraction: true,
            silent: type === "vibrate",
          })

          setTimeout(() => {
            notification.close()
          }, 10000)
        }

        console.log("✅ Alarma activada exitosamente")
        return wsSuccess || true // Retornar true si WebSocket falló pero la alarma local funcionó
      } catch (error) {
        console.error("❌ Error activando alarma:", error)
        setState((prev) => ({
          ...prev,
          error: "Error al activar la alarma",
        }))
        return false
      }
    },
    [state.isReady, playAlarmEffects],
  )

  // Clear error
  const clearError = useCallback(() => {
    console.log("🧹 Limpiando errores")
    setState((prev) => ({ ...prev, error: null }))
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

      // Activar alarma local
      const alarmType = message.type
      console.log("🚨 Activando alarma WebSocket tipo:", alarmType)

      // Play alarm effects
      if (alarmType === "sound") {
        playAlarmEffects("sound")
      } else if (alarmType === "vibrate") {
        playAlarmEffects("vibrate")
      } else {
        playAlarmEffects("both")
      }

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

    // Iniciar polling para alarmas (cada 3 segundos para mayor responsividad)
    const pollInterval = setInterval(() => {
      // Intentar conectar si no está conectado
      if (!websocketService.getConnectionStatus()) {
        console.log('🔌 WebSocket desconectado, intentando conectar...')
        websocketService.connect().then(connected => {
          if (connected) {
            console.log('✅ Reconectado exitosamente')
          }
        })
      } else {
        console.log('⏰ Ejecutando polling programado...')
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
      const channel = (window as any).alarmChannel
      if (channel) {
        channel.close()
      }
      
      // Limpiar servicio WebSocket
      websocketService.cleanup()
    }
  }, [initializeNotifications])

  return {
    ...state,
    isInitializing,
    isEnabling,
    isConnected,
    enableNotifications,
    triggerAlarm,
    initializeNotifications,
    clearError,
    // Compatibility properties
    isSubscribed: state.isReady,
    token: state.isReady ? "local-token" : null,
  }
}
