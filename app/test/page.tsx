"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TestPage() {
  const [apiStatus, setApiStatus] = useState<string>('Verificando...')
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    testAPI()
  }, [])

  const testAPI = async () => {
    try {
      const response = await fetch('/api/websocket')
      if (response.ok) {
        const data = await response.json()
        setApiStatus(`✅ API funcionando - ${data.connectionsCount} dispositivos conectados`)
      } else {
        setApiStatus(`❌ Error API: ${response.status}`)
      }
    } catch (error) {
      setApiStatus(`❌ Error de conexión: ${error}`)
    }
  }

  const testConnection = async () => {
    try {
      const testDeviceId = `test_${Date.now()}`
      
      // Probar conexión
      const connectResponse = await fetch('/api/websocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          deviceId: testDeviceId,
          deviceInfo: { test: true }
        })
      })
      
      if (connectResponse.ok) {
        const connectData = await connectResponse.json()
        setTestResult(`✅ Conexión exitosa: ${connectData.message}`)
        
        // Probar envío de alarma
        const alarmResponse = await fetch('/api/websocket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sendAlarm',
            deviceId: testDeviceId,
            alarmData: { type: 'sound', message: 'Prueba de alarma' }
          })
        })
        
        if (alarmResponse.ok) {
          const alarmData = await alarmResponse.json()
          setTestResult(prev => `${prev}\n✅ Alarma enviada: ${alarmData.message}`)
        } else {
          setTestResult(prev => `${prev}\n❌ Error enviando alarma: ${alarmResponse.status}`)
        }
        
        // Desconectar
        await fetch('/api/websocket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'disconnect',
            deviceId: testDeviceId
          })
        })
        
      } else {
        setTestResult(`❌ Error de conexión: ${connectResponse.status}`)
      }
    } catch (error) {
      setTestResult(`❌ Error de prueba: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">🧪 Página de Prueba - API WebSocket</h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Estado de la API</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {apiStatus}
          </p>
          <Button onClick={testAPI} variant="outline">
            🔄 Verificar API
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Prueba de Conexión</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Prueba la funcionalidad completa de la API WebSocket
          </p>
          <Button onClick={testConnection} className="w-full">
            🚀 Probar Conexión y Alarma
          </Button>
        </Card>

        {testResult && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Resultado de la Prueba</h2>
            <pre className="text-sm bg-muted p-4 rounded-md whitespace-pre-wrap">
              {testResult}
            </pre>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Instrucciones</h2>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>1. Verifica que la API esté funcionando</p>
            <p>2. Ejecuta la prueba de conexión</p>
            <p>3. Si todo funciona, la aplicación principal debería funcionar</p>
            <p>4. Si hay errores, revisa la consola del navegador</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
