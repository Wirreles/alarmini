"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Bell, Vibrate, RefreshCw, Database, CheckCircle, XCircle, AlertCircle, Shield, Settings } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { Badge } from "@/components/ui/badge"

export function PermissionsPanel() {
  const {
    permissions,
    isLoading,
    isRequesting,
    requestPermissions,
    requestNotifications,
    hasMinimumPermissions,
    permissionSummary,
  } = usePermissions()

  const [showDetails, setShowDetails] = useState(false)

  const getPermissionIcon = (granted: boolean, denied: boolean, unsupported: boolean) => {
    if (unsupported) return <XCircle className="h-4 w-4 text-gray-400" />
    if (granted) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (denied) return <XCircle className="h-4 w-4 text-red-500" />
    return <AlertCircle className="h-4 w-4 text-yellow-500" />
  }

  const getPermissionStatus = (granted: boolean, denied: boolean, unsupported: boolean) => {
    if (unsupported) return "No soportado"
    if (granted) return "Concedido"
    if (denied) return "Denegado"
    return "Pendiente"
  }

  const getPermissionBadge = (granted: boolean, denied: boolean, unsupported: boolean) => {
    if (unsupported) return <Badge variant="secondary">No disponible</Badge>
    if (granted)
      return (
        <Badge variant="default" className="bg-green-500">
          Activo
        </Badge>
      )
    if (denied) return <Badge variant="destructive">Denegado</Badge>
    return <Badge variant="outline">Pendiente</Badge>
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-sm p-4 bg-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-muted-foreground animate-pulse" />
          <span className="font-medium text-foreground">Verificando permisos...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm p-4 bg-card border border-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-heading font-semibold">Permisos de App</Label>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Permission Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">
              {permissionSummary.granted}/{permissionSummary.total}
            </span>
          </div>
          <Progress value={(permissionSummary.granted / permissionSummary.total) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{hasMinimumPermissions ? "Listo para usar" : "Permisos requeridos"}</span>
            <span>{Math.round((permissionSummary.granted / permissionSummary.total) * 100)}%</span>
          </div>
        </div>

        {/* Quick Actions */}
        {!hasMinimumPermissions && (
          <div className="space-y-2">
            <Button
              onClick={requestNotifications}
              disabled={isRequesting || permissions.notifications?.granted}
              className="w-full"
              size="sm"
            >
              {isRequesting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Bell className="h-4 w-4 mr-2" />}
              {permissions.notifications?.granted ? "Notificaciones Activas" : "Habilitar Notificaciones"}
            </Button>
          </div>
        )}

        {/* Detailed Permissions */}
        {showDetails && (
          <div className="space-y-3 pt-2 border-t border-border">
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Notificaciones</span>
                {getPermissionIcon(
                  permissions.notifications?.granted || false,
                  permissions.notifications?.denied || false,
                  permissions.notifications?.unsupported || false,
                )}
              </div>
              {getPermissionBadge(
                permissions.notifications?.granted || false,
                permissions.notifications?.denied || false,
                permissions.notifications?.unsupported || false,
              )}
            </div>

            {/* Vibration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Vibración</span>
                {getPermissionIcon(
                  permissions.vibrate?.granted || false,
                  permissions.vibrate?.denied || false,
                  permissions.vibrate?.unsupported || false,
                )}
              </div>
              {getPermissionBadge(
                permissions.vibrate?.granted || false,
                permissions.vibrate?.denied || false,
                permissions.vibrate?.unsupported || false,
              )}
            </div>

            {/* Background Sync */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Segundo Plano</span>
                {getPermissionIcon(
                  permissions.backgroundSync?.granted || false,
                  permissions.backgroundSync?.denied || false,
                  permissions.backgroundSync?.unsupported || false,
                )}
              </div>
              {getPermissionBadge(
                permissions.backgroundSync?.granted || false,
                permissions.backgroundSync?.denied || false,
                permissions.backgroundSync?.unsupported || false,
              )}
            </div>

            {/* Persistent Storage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Almacenamiento</span>
                {getPermissionIcon(
                  permissions.persistentStorage?.granted || false,
                  permissions.persistentStorage?.denied || false,
                  permissions.persistentStorage?.unsupported || false,
                )}
              </div>
              {getPermissionBadge(
                permissions.persistentStorage?.granted || false,
                permissions.persistentStorage?.denied || false,
                permissions.persistentStorage?.unsupported || false,
              )}
            </div>

            {/* Request All Button */}
            {!hasMinimumPermissions && (
              <Button
                onClick={requestPermissions}
                disabled={isRequesting}
                variant="outline"
                className="w-full mt-3 bg-transparent"
                size="sm"
              >
                {isRequesting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Solicitar Todos los Permisos
              </Button>
            )}
          </div>
        )}

        {/* Status Message */}
        <div className="text-xs text-muted-foreground text-center">
          {hasMinimumPermissions ? (
            <span className="text-green-600">✓ Aplicación lista para usar</span>
          ) : (
            <span className="text-yellow-600">⚠ Permisos requeridos para funcionar</span>
          )}
        </div>
      </div>
    </Card>
  )
}
