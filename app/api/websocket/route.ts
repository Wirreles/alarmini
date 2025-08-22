import { type NextRequest, NextResponse } from "next/server"

// Simular almacenamiento en memoria para las conexiones
// En producción, usarías una base de datos real
const connections = new Map<string, { lastSeen: number; deviceInfo: any }>()
const alarmHistory: Array<{ type: string; timestamp: number; senderId: string }> = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, deviceId, deviceInfo, alarmData } = body

    console.log(`📡 WebSocket API: ${action}`, { deviceId, deviceInfo, alarmData })

    switch (action) {
      case 'connect':
        // Registrar dispositivo
        connections.set(deviceId, {
          lastSeen: Date.now(),
          deviceInfo: deviceInfo || {}
        })
        
        console.log(`✅ Dispositivo ${deviceId} conectado`)
        
        return NextResponse.json({
          success: true,
          message: 'Dispositivo conectado',
          deviceId,
          connectionsCount: connections.size,
          alarmHistory: alarmHistory.slice(-10) // Últimas 10 alarmas
        })

      case 'disconnect':
        // Desregistrar dispositivo
        connections.delete(deviceId)
        console.log(`❌ Dispositivo ${deviceId} desconectado`)
        
        return NextResponse.json({
          success: true,
          message: 'Dispositivo desconectado',
          connectionsCount: connections.size
        })

      case 'sendAlarm':
        // Enviar alarma a todos los dispositivos
        if (!alarmData || !alarmData.type) {
          return NextResponse.json(
            { error: 'Datos de alarma inválidos' },
            { status: 400 }
          )
        }

        const alarm = {
          type: alarmData.type,
          message: alarmData.message,
          timestamp: Date.now(),
          senderId: deviceId
        }

        // Agregar a historial
        alarmHistory.push(alarm)
        if (alarmHistory.length > 100) {
          alarmHistory.shift() // Mantener solo las últimas 100
        }

        // Actualizar timestamp de último visto para el dispositivo
        if (connections.has(deviceId)) {
          connections.get(deviceId)!.lastSeen = Date.now()
        }

        console.log(`🚨 Alarma enviada por ${deviceId}:`, alarm)

        return NextResponse.json({
          success: true,
          message: 'Alarma enviada a todos los dispositivos',
          alarm,
          connectionsCount: connections.size,
          recipients: Array.from(connections.keys()).filter(id => id !== deviceId)
        })

      case 'ping':
        // Actualizar timestamp de último visto
        if (connections.has(deviceId)) {
          connections.get(deviceId)!.lastSeen = Date.now()
        }
        
        return NextResponse.json({
          success: true,
          message: 'Ping recibido',
          timestamp: Date.now()
        })

      case 'getStatus':
        // Obtener estado de la conexión
        const isConnected = connections.has(deviceId)
        const deviceConnection = connections.get(deviceId)
        
        return NextResponse.json({
          success: true,
          connected: isConnected,
          deviceId,
          lastSeen: deviceConnection?.lastSeen,
          connectionsCount: connections.size,
          alarmHistory: alarmHistory.slice(-10)
        })

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Error en WebSocket API:', error)
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Endpoint para obtener estado general
  const now = Date.now()
  const activeConnections = Array.from(connections.entries())
    .filter(([_, conn]) => now - conn.lastSeen < 30000) // Solo conexiones activas en los últimos 30 segundos

  return NextResponse.json({
    success: true,
    totalConnections: connections.size,
    activeConnections: activeConnections.length,
    devices: activeConnections.map(([id, conn]) => ({
      deviceId: id,
      lastSeen: conn.lastSeen,
      deviceInfo: conn.deviceInfo
    })),
    alarmHistory: alarmHistory.slice(-20), // Últimas 20 alarmas
    uptime: process.uptime()
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
