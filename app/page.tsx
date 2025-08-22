"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Volume2, Vibrate, AlertTriangle, Loader2, Bell, BellOff, X } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { usePermissions } from "@/hooks/use-permissions"
import { AlarmTestPanel } from "@/components/alarm-test-panel"
import { PermissionsPanel } from "@/components/permissions-panel"

export default function AlarmApp() {
  const [alarmType, setAlarmType] = useState<"sound" | "vibrate">("sound")
  const [isActivating, setIsActivating] = useState(false)
  const [lastActivation, setLastActivation] = useState<Date | null>(null)

  const {
    permission,
    isSubscribed,
    isSupported,
    isInitializing,
    isEnabling,
    error: notificationError,
    enableNotifications,
    triggerAlarm,
    clearError,
  } = useNotifications()

  const {
    permissions,
    isLoading: permissionsLoading,
    isRequesting: permissionsRequesting,
    hasMinimumPermissions,
    isAppReady,
    requestAllPermissions,
  } = usePermissions()

  // Handle URL parameters for shortcuts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const type = urlParams.get("type")
    if (type === "sound" || type === "vibrate") {
      setAlarmType(type)
    }
  }, [])

  const handleAlarmActivation = useCallback(async () => {
    // Clear any previous errors
    clearError()

    if (!isSubscribed) {
      alert("Primero debes habilitar las notificaciones para enviar alarmas")
      return
    }

    if (!hasMinimumPermissions) {
      alert("La aplicación necesita permisos adicionales para funcionar correctamente")
      return
    }

    setIsActivating(true)

    try {
      // Add pulse animation
      const button = document.querySelector(".alarm-button")
      button?.classList.add("pulsing")

      const success = await triggerAlarm(alarmType)

      if (success) {
        setLastActivation(new Date())
      } else {
        alert("Error al enviar la alarma. Inténtalo de nuevo.")
      }

      // Remove pulse animation
      setTimeout(() => {
        button?.classList.remove("pulsing")
      }, 500)
    } catch (error) {
      console.error("Error activating alarm:", error)
      alert("Error al enviar la alarma. Inténtalo de nuevo.")
    } finally {
      setIsActivating(false)
    }
  }, [alarmType, isSubscribed, triggerAlarm, hasMinimumPermissions, clearError])

  const handleEnableNotifications = useCallback(async () => {
    const success = await enableNotifications()
    if (!success && notificationError) {
      // Error is already set in the hook
      return
    }
  }, [enableNotifications, notificationError])

  const handleRequestAllPermissions = useCallback(async () => {
    await requestAllPermissions()
    // After requesting permissions, try to enable notifications
    if (permissions.notifications.granted) {
      await enableNotifications()
    }
  }, [requestAllPermissions, permissions.notifications.granted, enableNotifications])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Show loading state while initializing
  if (isInitializing || permissionsLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Inicializando aplicación...</p>
        </div>
      </main>
    )
  }

  // Show unsupported message
  if (!isSupported) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-heading font-bold mb-2">No Compatible</h2>
          <p className="text-muted-foreground mb-4">
            Tu navegador no soporta notificaciones push. Usa un navegador moderno como Chrome, Firefox o Safari.
          </p>
          <p className="text-xs text-muted-foreground">
            En dispositivos iOS, asegúrate de usar Safari o agregar la app a la pantalla de inicio.
          </p>
        </Card>
      </main>
    )
  }

  const canActivateAlarm = isSubscribed && hasMinimumPermissions && !isActivating
  const needsSetup = !isSubscribed || !hasMinimumPermissions

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <AlertTriangle className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-heading font-bold text-foreground">Alarma Compartida</h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-sm">
          Presiona el botón para enviar una alerta de emergencia a todos los dispositivos conectados
        </p>
      </div>

      {/* Error Alert */}
      {notificationError && (
        <Alert className="w-full max-w-sm border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">{notificationError}</span>
            <Button variant="ghost" size="sm" onClick={clearError} className="h-auto p-1 ml-2">
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Setup Card */}
      {needsSetup && (
        <Card className="w-full max-w-sm p-4 bg-muted border border-border">
          <div className="flex items-center gap-3 mb-3">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Configuración Requerida</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {!permissions.notifications.granted
              ? "Habilita las notificaciones para usar la aplicación"
              : "Configurando sistema de alarmas..."}
          </p>
          <Button
            onClick={!permissions.notifications.granted ? handleRequestAllPermissions : handleEnableNotifications}
            className="w-full"
            size="sm"
            disabled={isEnabling || permissionsRequesting}
          >
            {isEnabling || permissionsRequesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Configurando...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                {!permissions.notifications.granted ? "Configurar Permisos" : "Habilitar Notificaciones"}
              </>
            )}
          </Button>
        </Card>
      )}

      {/* Connected Status */}
      {isSubscribed && hasMinimumPermissions && (
        <Card className="w-full max-w-sm p-3 bg-card border border-border">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-foreground">Conectado al sistema de alarmas</span>
          </div>
        </Card>
      )}

      {/* Main Alarm Button */}
      <div className="flex flex-col items-center gap-6">
        <Button
          onClick={handleAlarmActivation}
          disabled={!canActivateAlarm}
          className={`alarm-button w-48 h-48 rounded-full text-2xl font-heading font-bold shadow-2xl border-4 border-primary/20 transition-all duration-300 ${
            !canActivateAlarm ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
          }`}
          size="lg"
        >
          {isActivating ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-12 w-12 animate-spin" />
              <span className="text-lg">Enviando...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <AlertTriangle className="h-12 w-12" />
              <span>ACTIVAR ALARMA</span>
            </div>
          )}
        </Button>

        {/* Button Status */}
        {!canActivateAlarm && (
          <Card className="p-3 bg-muted border border-border">
            <p className="text-sm text-muted-foreground text-center">
              {!isSubscribed
                ? "Configura las notificaciones para activar"
                : !hasMinimumPermissions
                  ? "Permisos insuficientes"
                  : "Preparando..."}
            </p>
          </Card>
        )}

        {/* Last Activation Info */}
        {lastActivation && (
          <Card className="p-3 bg-card border border-border">
            <p className="text-sm text-muted-foreground text-center">Última activación: {formatTime(lastActivation)}</p>
          </Card>
        )}
      </div>

      {/* Alarm Type Toggle */}
      <Card className="w-full max-w-sm p-6 bg-card border border-border">
        <div className="space-y-4">
          <Label className="text-base font-heading font-semibold text-card-foreground">Tipo de Alerta</Label>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className={`h-5 w-5 ${alarmType === "sound" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`font-medium ${alarmType === "sound" ? "text-foreground" : "text-muted-foreground"}`}>
                Sonido
              </span>
            </div>

            <Switch
              checked={alarmType === "vibrate"}
              onCheckedChange={(checked) => setAlarmType(checked ? "vibrate" : "sound")}
              className="data-[state=checked]:bg-secondary"
            />

            <div className="flex items-center gap-3">
              <span className={`font-medium ${alarmType === "vibrate" ? "text-foreground" : "text-muted-foreground"}`}>
                Vibración
              </span>
              <Vibrate className={`h-5 w-5 ${alarmType === "vibrate" ? "text-secondary" : "text-muted-foreground"}`} />
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Modo actual:{" "}
              <span className="font-semibold text-foreground">{alarmType === "sound" ? "Sonido" : "Vibración"}</span>
            </p>
          </div>
        </div>
      </Card>

      <PermissionsPanel />

      <AlarmTestPanel />

      {/* Instructions */}
      <Card className="w-full max-w-sm p-4 bg-muted/50 border border-border">
        <div className="text-center space-y-2">
          <h3 className="font-heading font-semibold text-sm text-foreground">Estado de la Aplicación</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• {isAppReady ? "✅ Aplicación lista para usar" : "⚠️ Configuración pendiente"}</li>
            <li>• {permissions.notifications.granted ? "✅" : "❌"} Notificaciones</li>
            <li>• {permissions.serviceWorker.granted ? "✅" : "❌"} Service Worker</li>
            <li>• {permissions.vibrate.granted ? "✅" : "❌"} Vibración</li>
          </ul>
        </div>
      </Card>
    </main>
  )
}
