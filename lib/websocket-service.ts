export interface AlarmMessage {
  type: 'sound' | 'vibrate'
  message?: string
  timestamp: number
  senderId: string
}

export interface WebSocketMessage {
  type: 'alarm' | 'join' | 'leave' | 'ping'
  data?: any
  timestamp: number
  senderId: string
}

class WebSocketService {
  private _isConnected = false
  private _isConnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private pingInterval: NodeJS.Timeout | null = null
  private messageHandlers: ((message: AlarmMessage) => void)[] = []
  private connectionHandlers: ((connected: boolean) => void)[] = []
  private deviceId: string
  private deviceInfo: any
  private lastProcessedAlarmTimestamp: number = 0

  constructor() {
    // Generar ID único para este dispositivo
    this.deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Información del dispositivo
    this.deviceInfo = {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
      language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
      timestamp: Date.now()
    }
  }

  async connect(): Promise<boolean> {
    if (this._isConnecting || this._isConnected) {
      return true
    }

    this._isConnecting = true

    try {
      console.log('🔌 Conectando a servicio de alarmas compartidas...')
      
      // Conectar usando nuestra API
      const response = await fetch('/api/websocket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'connect',
          deviceId: this.deviceId,
          deviceInfo: this.deviceInfo
        }),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Conectado al servicio de alarmas:', result)
      
      this._isConnected = true
      this._isConnecting = false
      this.reconnectAttempts = 0
      
      // Iniciar ping para mantener la conexión activa
      this.startPing()
      
      // Notificar que estamos conectados
      this.notifyConnectionChange(true)
      
      return true
    } catch (error) {
      console.error('❌ Error conectando al servicio:', error)
      this._isConnecting = false
      return false
    }
  }

  private startPing(): void {
    // Enviar ping cada 15 segundos para mantener la conexión activa
    this.pingInterval = setInterval(async () => {
      if (this._isConnected) {
        try {
          await fetch('/api/websocket', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'ping',
              deviceId: this.deviceId
            }),
          })
        } catch (error) {
          console.warn('⚠️ Error enviando ping:', error)
          // Si falla el ping, intentar reconectar
          this.handleConnectionLoss()
        }
      }
    }, 15000)
  }

  private async handleConnectionLoss(): Promise<void> {
    if (this._isConnected) {
      this._isConnected = false
      this.notifyConnectionChange(false)
      
      // Intentar reconectar
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`🔄 Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      if (!this._isConnected) {
        this.connect()
      }
    }, delay)
  }

  async sendAlarm(alarmData: Omit<AlarmMessage, 'timestamp' | 'senderId'>): Promise<boolean> {
    try {
      if (!this._isConnected) {
        console.warn('⚠️ No conectado, intentando conectar...')
        const connected = await this.connect()
        if (!connected) {
          throw new Error('No se pudo conectar al servicio')
        }
      }

      console.log('🚨 Enviando alarma a través del servicio...')
      
      const response = await fetch('/api/websocket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendAlarm',
          deviceId: this.deviceId,
          alarmData
        }),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Alarma enviada:', result)
      console.log('📡 Alarma enviada a', result.recipients?.length || 0, 'dispositivos')
      
      // Notificar a los handlers locales
      const alarmMessage: AlarmMessage = {
        ...alarmData,
        timestamp: Date.now(),
        senderId: this.deviceId
      }
      
      console.log('🔄 Notificando handlers locales con mensaje:', alarmMessage)
      this.notifyMessageHandlers(alarmMessage)
      
      return true
    } catch (error) {
      console.error('❌ Error enviando alarma:', error)
      return false
    }
  }

  // Método para simular recepción de alarmas (en una implementación real, usarías Server-Sent Events o WebSockets)
  async pollForAlarms(): Promise<void> {
    if (!this._isConnected) return

    try {
      console.log('🔍 Polling para nuevas alarmas...')
      
      const response = await fetch('/api/websocket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getStatus',
          deviceId: this.deviceId
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Procesar solo alarmas nuevas que no sean nuestras
        if (result.alarmHistory && Array.isArray(result.alarmHistory)) {
          let newAlarmsCount = 0
          
          result.alarmHistory.forEach((alarm: any) => {
            // Solo procesar alarmas que no sean nuestras y sean más recientes que la última procesada
            if (alarm.senderId !== this.deviceId && alarm.timestamp > this.lastProcessedAlarmTimestamp) {
              console.log('🆕 Nueva alarma detectada:', alarm)
              
              const alarmMessage: AlarmMessage = {
                type: alarm.type,
                message: alarm.message,
                timestamp: alarm.timestamp,
                senderId: alarm.senderId
              }
              
              // Actualizar timestamp de última alarma procesada
              this.lastProcessedAlarmTimestamp = Math.max(this.lastProcessedAlarmTimestamp, alarm.timestamp)
              
              // Notificar a los handlers locales
              this.notifyMessageHandlers(alarmMessage)
              newAlarmsCount++
            }
          })
          
          if (newAlarmsCount > 0) {
            console.log(`✅ ${newAlarmsCount} nueva(s) alarma(s) procesada(s)`)
          } else {
            console.log('ℹ️ No hay nuevas alarmas')
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error polling para alarmas:', error)
    }
  }

  onMessage(handler: (message: AlarmMessage) => void): void {
    this.messageHandlers.push(handler)
  }

  onConnectionChange(handler: (connected: boolean) => void): void {
    this.connectionHandlers.push(handler)
  }

  private notifyMessageHandlers(message: AlarmMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('❌ Error en handler de mensaje:', error)
      }
    })
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected)
      } catch (error) {
        console.error('❌ Error en handler de conexión:', error)
      }
    })
  }

  // Método público para obtener el estado de conexión
  getConnectionStatus(): boolean {
    return this._isConnected
  }

  // Método público para verificar si está conectado
  isConnected(): boolean {
    return this._isConnected
  }

  getDeviceId(): string {
    return this.deviceId
  }

  async disconnect(): Promise<void> {
    try {
      if (this._isConnected) {
        await fetch('/api/websocket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'disconnect',
            deviceId: this.deviceId
          }),
        })
      }
      
      this._isConnected = false
      this.notifyConnectionChange(false)
      
      if (this.pingInterval) {
        clearInterval(this.pingInterval)
        this.pingInterval = null
      }
      
      console.log('🔌 Desconectado del servicio')
    } catch (error) {
      console.error('❌ Error desconectando:', error)
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.disconnect()
      this.messageHandlers = []
      this.connectionHandlers = []
      console.log('🧹 Servicio WebSocket limpiado')
    } catch (error) {
      console.error('❌ Error limpiando WebSocket:', error)
    }
  }
}

// Instancia singleton del servicio
export const websocketService = new WebSocketService()
