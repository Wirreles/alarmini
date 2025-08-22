"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { websocketService } from '@/lib/websocket-service'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [alarmHistory, setAlarmHistory] = useState<any[]>([])
  const [connections, setConnections] = useState<any[]>([])
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    updateDebugInfo()
    const interval = setInterval(updateDebugInfo, 2000)
    return () => clearInterval(interval)
  }, [])

  const updateDebugInfo = async () => {
    try {
      // Obtener estado general
      const statusResponse = await fetch('/api/websocket')
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setDebugInfo(statusData)
        setConnections(statusData.devices || [])
        setAlarmHistory(statusData.alarmHistory || [])
      }
    } catch (error) {
      console.error('Error actualizando debug info:', error)
    }
  }

  const testAlarmSync = async () => {
    setIsPolling(true)
    try {
      console.log('🧪 Iniciando prueba de sincronización...')
      
      // Enviar alarma de prueba
      const testDeviceId = `debug_test_${Date.now()}`
      const alarmResponse = await fetch('/api/websocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendAlarm',
          deviceId: testDeviceId,
          alarmData: { 
            type: 'sound', 
            message: 'Prueba de sincronización - ' + new Date().toLocaleTimeString() 
          }
        })
      })
      
      if (alarmResponse.ok) {
        const alarmData = await alarmResponse.json()
        console.log('✅ Alarma de prueba enviada:', alarmData)
        
        // Esperar un momento y luego verificar si llegó a otros dispositivos
        setTimeout(async () => {
          console.log('🔍 Verificando si la alarma llegó a otros dispositivos...')
          await updateDebugInfo()
          setIsPolling(false)
        }, 2000)
      }
    } catch (error) {
      console.error('❌ Error en prueba de sincronización:', error)
      setIsPolling(false)
    }
  }

  const forcePoll = async () => {
    console.log('🔄 Forzando polling manual...')
    await websocketService.pollForAlarms()
    await updateDebugInfo()
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">🔍 Debug - Sincronización de Alarmas</h1>
        
        {/* Estado del Servidor */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Estado del Servidor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{debugInfo.totalConnections || 0}</div>
              <div className="text-sm text-muted-foreground">Total Conectados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{debugInfo.activeConnections || 0}</div>
              <div className="text-sm text-muted-foreground">Activos (30s)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{debugInfo.alarmHistory?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Alarmas en Historial</div>
            </div>
          </div>
        </Card>

        {/* Dispositivos Conectados */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Dispositivos Conectados</h2>
          <div className="space-y-2">
            {connections.length > 0 ? (
              connections.map((device, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{device.deviceId.substring(0, 20)}...</div>
                    <div className="text-sm text-muted-foreground">
                      Último visto: {new Date(device.lastSeen).toLocaleTimeString()}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {device.deviceInfo?.platform || 'Unknown'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">No hay dispositivos conectados</p>
            )}
          </div>
        </Card>

        {/* Historial de Alarmas */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Historial de Alarmas</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alarmHistory.length > 0 ? (
              alarmHistory.slice().reverse().map((alarm, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">
                      {alarm.type === 'sound' ? '🔊' : '📳'} {alarm.type}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {alarm.message || 'Sin mensaje'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(alarm.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {alarm.senderId.substring(0, 15)}...
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">No hay alarmas en el historial</p>
            )}
          </div>
        </Card>

        {/* Acciones de Debug */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Acciones de Debug</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={testAlarmSync} 
              disabled={isPolling}
              className="flex-1"
            >
              {isPolling ? '🔄 Probando...' : '🧪 Probar Sincronización'}
            </Button>
            <Button 
              onClick={forcePoll} 
              variant="outline"
              className="flex-1"
            >
              🔄 Forzar Polling
            </Button>
            <Button 
              onClick={updateDebugInfo} 
              variant="outline"
              className="flex-1"
            >
              📊 Actualizar Info
            </Button>
          </div>
        </Card>

        {/* Información del Cliente */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Device ID:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {websocketService.getDeviceId()}
              </code>
            </div>
            <div className="flex justify-between">
              <span>Estado de Conexión:</span>
              <Badge variant={websocketService.getConnectionStatus() ? "default" : "destructive"}>
                {websocketService.getConnectionStatus() ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Timestamp Última Alarma:</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Instrucciones */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Instrucciones de Debug</h2>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>1. <strong>Probar Sincronización</strong>: Envía una alarma de prueba y verifica que llegue a otros dispositivos</p>
            <p>2. <strong>Forzar Polling</strong>: Ejecuta manualmente el polling para verificar nuevas alarmas</p>
            <p>3. <strong>Monitorear</strong>: Observa los logs en la consola del navegador</p>
            <p>4. <strong>Verificar</strong>: Confirma que las alarmas aparezcan en el historial</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
