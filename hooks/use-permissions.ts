"use client"

import { useState, useEffect, useCallback } from "react"

export interface PermissionStatus {
  granted: boolean
  denied: boolean
  prompt: boolean
  unsupported: boolean
}

export interface AppPermissions {
  notifications: PermissionStatus
  vibrate: PermissionStatus
  serviceWorker: PermissionStatus
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<AppPermissions>({
    notifications: { granted: false, denied: false, prompt: false, unsupported: false },
    vibrate: { granted: false, denied: false, prompt: false, unsupported: false },
    serviceWorker: { granted: false, denied: false, prompt: false, unsupported: false },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRequesting, setIsRequesting] = useState(false)

  // Check notification permissions
  const checkNotificationPermission = useCallback(async (): Promise<PermissionStatus> => {
    if (!("Notification" in window)) {
      return { granted: false, denied: false, prompt: false, unsupported: true }
    }

    const permission = Notification.permission
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isChromeIOS = isIOS && /CriOS/.test(navigator.userAgent)

    // En iOS, las notificaciones solo funcionan en Safari o PWA
    if (isIOS && isChromeIOS) {
      return {
        granted: false,
        denied: false,
        prompt: false,
        unsupported: true,
      }
    }

    return {
      granted: permission === "granted",
      denied: permission === "denied",
      prompt: permission === "default",
      unsupported: false,
    }
  }, [])

  // Check vibration support
  const checkVibrationPermission = useCallback(async (): Promise<PermissionStatus> => {
    // iOS nunca soporta vibración
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSupported = !isIOS && "vibrate" in navigator

    return {
      granted: isSupported,
      denied: false,
      prompt: false,
      unsupported: !isSupported,
    }
  }, [])

  // Check service worker support and registration
  const checkServiceWorkerPermission = useCallback(async (): Promise<PermissionStatus> => {
    if (!("serviceWorker" in navigator)) {
      return { granted: false, denied: false, prompt: false, unsupported: true }
    }

    try {
      // Check if service worker is already registered
      const registration = await navigator.serviceWorker.getRegistration()
      
      if (registration) {
        console.log("✅ Service Worker ya registrado:", registration)
        return {
          granted: true,
          denied: false,
          prompt: false,
          unsupported: false,
        }
      } else {
        console.log("⚠️ Service Worker no registrado")
        return {
          granted: false,
          denied: false,
          prompt: true,
          unsupported: false,
        }
      }
    } catch (error) {
      console.error("❌ Error verificando Service Worker:", error)
      return { granted: false, denied: true, prompt: false, unsupported: false }
    }
  }, [])

  // Request notification permissions
  const requestNotifications = useCallback(async (): Promise<PermissionStatus> => {
    if (!("Notification" in window)) {
      return { granted: false, denied: false, prompt: false, unsupported: true }
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isChromeIOS = isIOS && /CriOS/.test(navigator.userAgent)

    // En iOS Chrome, mostrar instrucciones especiales
    if (isIOS && isChromeIOS) {
      console.log("ℹ️ iOS Chrome: Las notificaciones requieren Safari o PWA")
      const status = { granted: false, denied: false, prompt: false, unsupported: true }
      setPermissions((prev) => ({ ...prev, notifications: status }))
      return status
    }

    try {
      console.log("🔔 Solicitando permisos de notificación...")
      const permission = await Notification.requestPermission()
      console.log("📱 Resultado de permisos:", permission)

      const status = {
        granted: permission === "granted",
        denied: permission === "denied",
        prompt: permission === "default",
        unsupported: false,
      }

      setPermissions((prev) => ({ ...prev, notifications: status }))
      return status
    } catch (error) {
      console.error("❌ Error solicitando permisos de notificación:", error)
      const status = { granted: false, denied: true, prompt: false, unsupported: false }
      setPermissions((prev) => ({ ...prev, notifications: status }))
      return status
    }
  }, [])

  // Register service worker
  const registerServiceWorker = useCallback(async (): Promise<PermissionStatus> => {
    if (!("serviceWorker" in navigator)) {
      return { granted: false, denied: false, prompt: false, unsupported: true }
    }

    try {
      console.log("🔧 Registrando Service Worker...")
      
      // Try to register the basic service worker
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/"
      })
      
      console.log("✅ Service Worker registrado exitosamente:", registration)

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready
      console.log("✅ Service Worker listo para usar")

      const status = { granted: true, denied: false, prompt: false, unsupported: false }
      setPermissions((prev) => ({ ...prev, serviceWorker: status }))
      return status
    } catch (error) {
      console.error("❌ Error registrando Service Worker:", error)
      
      // En iOS, el Service Worker puede no ser crítico
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS) {
        console.log("ℹ️ iOS: Service Worker no crítico para la funcionalidad")
        const status = { granted: false, denied: false, prompt: false, unsupported: false }
        setPermissions((prev) => ({ ...prev, serviceWorker: status }))
        return status
      }
      
      const status = { granted: false, denied: true, prompt: false, unsupported: false }
      setPermissions((prev) => ({ ...prev, serviceWorker: status }))
      return status
    }
  }, [])

  // Check all permissions
  const checkAllPermissions = useCallback(async () => {
    setIsLoading(true)
    try {
      const [notifications, vibrate, serviceWorker] = await Promise.all([
        checkNotificationPermission(),
        checkVibrationPermission(),
        checkServiceWorkerPermission(),
      ])

      setPermissions({
        notifications,
        vibrate,
        serviceWorker,
      })
    } catch (error) {
      console.error("❌ Error verificando permisos:", error)
    } finally {
      setIsLoading(false)
    }
  }, [checkNotificationPermission, checkVibrationPermission, checkServiceWorkerPermission])

  // Request all permissions
  const requestAllPermissions = useCallback(async () => {
    setIsRequesting(true)
    try {
      console.log("🚀 Solicitando todos los permisos...")
      
      // Register service worker first
      await registerServiceWorker()

      // Then request notifications
      await requestNotifications()

      // Check vibration (no request needed)
      const vibrate = await checkVibrationPermission()
      setPermissions((prev) => ({ ...prev, vibrate }))

      return true
    } catch (error) {
      console.error("❌ Error solicitando permisos:", error)
      return false
    } finally {
      setIsRequesting(false)
    }
  }, [registerServiceWorker, requestNotifications, checkVibrationPermission])

  // Alias for requestAllPermissions to fix the missing function
  const requestPermissions = requestAllPermissions

  // Check if minimum permissions are granted
  const hasMinimumPermissions = useCallback(() => {
    return permissions.notifications.granted && permissions.serviceWorker.granted
  }, [permissions])

  // Check if app is ready to use
  const isAppReady = useCallback(() => {
    return hasMinimumPermissions() && !isLoading
  }, [hasMinimumPermissions, isLoading])

  // Get permission summary
  const getPermissionSummary = useCallback(() => {
    const allPermissions = Object.values(permissions)
    const total = allPermissions.length
    const granted = allPermissions.filter((p) => p.granted).length
    const denied = allPermissions.filter((p) => p.denied).length
    const unsupported = allPermissions.filter((p) => p.unsupported).length

    return {
      total,
      granted,
      denied,
      unsupported,
      ready: hasMinimumPermissions(),
    }
  }, [permissions, hasMinimumPermissions])

  // Initialize permissions check on mount
  useEffect(() => {
    checkAllPermissions()
  }, [checkAllPermissions])

  // Listen for permission changes (when user manually changes browser settings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAllPermissions()
      }
    }

    const handleFocus = () => {
      checkAllPermissions()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [checkAllPermissions])

  return {
    permissions,
    isLoading,
    isRequesting,
    checkAllPermissions,
    requestAllPermissions,
    requestPermissions, // Add the missing function
    requestNotifications,
    registerServiceWorker,
    hasMinimumPermissions: hasMinimumPermissions(),
    isAppReady: isAppReady(),
    permissionSummary: getPermissionSummary(),
  }
}
