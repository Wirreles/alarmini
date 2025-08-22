import { API_ENDPOINTS, FCM_CONFIG } from './firebase-config'
import { getFCMToken, onFCMMessage, requestNotificationPermission, isFCMSupported } from './firebase'

export interface FCMToken {
  token: string
  timestamp: number
  deviceType: 'web' | 'mobile'
}

export interface AlarmMessage {
  type: 'sound' | 'vibrate'
  message?: string
  timestamp: number
  senderId: string
}

class FCMService {
  private token: string | null = null
  private isInitialized = false
  private messageHandlers: ((message: AlarmMessage) => void)[] = []
  private unsubscribeFCM: (() => void) | null = null

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true

    try {
      console.log('🚀 Inicializando servicio FCM...')
      
      // Verificar si FCM está soportado
      if (!isFCMSupported()) {
        console.warn('⚠️ FCM no soportado en este navegador')
        return false
      }
      
      // Verificar si estamos en un navegador web
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        await this.initializeWebPush()
      }
      
      this.isInitialized = true
      console.log('✅ Servicio FCM inicializado')
      return true
    } catch (error) {
      console.error('❌ Error inicializando FCM:', error)
      return false
    }
  }

  private async initializeWebPush(): Promise<void> {
    try {
      // Solicitar permisos de notificación
      const permission = await requestNotificationPermission()
      if (permission !== 'granted') {
        throw new Error('Permisos de notificación denegados')
      }

      // Obtener token de FCM
      await this.getFCMToken()
      
      // Configurar listener para mensajes FCM
      this.setupFCMMessageListener()
    } catch (error) {
      console.error('❌ Error inicializando web push:', error)
      throw error
    }
  }

  private async getFCMToken(): Promise<string | null> {
    try {
      // Obtener token real de FCM
      this.token = await getFCMToken()
      
      if (this.token) {
        console.log('🔑 Token FCM obtenido:', this.token.substring(0, 20) + '...')
        
        // Suscribir al tópico de alarmas
        await this.subscribeToAlarms()
        
        return this.token
      } else {
        console.error('❌ No se pudo obtener token FCM')
        return null
      }
    } catch (error) {
      console.error('❌ Error obteniendo token FCM:', error)
      return null
    }
  }

  private setupFCMMessageListener(): void {
    try {
      this.unsubscribeFCM = onFCMMessage((payload) => {
        console.log('📨 Mensaje FCM recibido:', payload)
        
        const { data } = payload
        if (data && data.action === 'trigger_alarm') {
          const message: AlarmMessage = {
            type: data.alarmType as 'sound' | 'vibrate',
            message: data.message,
            timestamp: parseInt(data.timestamp) || Date.now(),
            senderId: data.senderId || 'unknown'
          }
          
          // Notificar a los handlers locales
          this.notifyMessageHandlers(message)
        }
      })
      
      console.log('✅ Listener FCM configurado')
    } catch (error) {
      console.error('❌ Error configurando listener FCM:', error)
    }
  }

  async subscribeToAlarms(): Promise<boolean> {
    if (!this.token) {
      console.error('❌ No hay token FCM disponible')
      return false
    }

    try {
      console.log('📱 Suscribiendo a alarmas...')
      
      const response = await fetch(API_ENDPOINTS.SUBSCRIBE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: this.token }),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Suscrito a alarmas:', result)
      return true
    } catch (error) {
      console.error('❌ Error suscribiendo a alarmas:', error)
      return false
    }
  }

  async sendAlarm(alarmData: Omit<AlarmMessage, 'timestamp' | 'senderId'>): Promise<boolean> {
    try {
      console.log('🚨 Enviando alarma a todos los dispositivos...')
      
      const message: AlarmMessage = {
        ...alarmData,
        timestamp: Date.now(),
        senderId: this.token || 'unknown',
      }

      const response = await fetch(API_ENDPOINTS.SEND_ALARM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Alarma enviada:', result)
      
      // Notificar a los handlers locales
      this.notifyMessageHandlers(message)
      
      return true
    } catch (error) {
      console.error('❌ Error enviando alarma:', error)
      return false
    }
  }

  onMessage(handler: (message: AlarmMessage) => void): void {
    this.messageHandlers.push(handler)
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

  async unsubscribeFromAlarms(): Promise<boolean> {
    if (!this.token) return true

    try {
      console.log('📱 Desuscribiendo de alarmas...')
      
      const response = await fetch(API_ENDPOINTS.UNSUBSCRIBE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: this.token }),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      console.log('✅ Desuscrito de alarmas')
      return true
    } catch (error) {
      console.error('❌ Error desuscribiendo de alarmas:', error)
      return false
    }
  }

  getToken(): string | null {
    return this.token
  }

  isReady(): boolean {
    return this.isInitialized && this.token !== null
  }

  async cleanup(): Promise<void> {
    try {
      // Desuscribir de FCM
      if (this.unsubscribeFCM) {
        this.unsubscribeFCM()
        this.unsubscribeFCM = null
      }
      
      await this.unsubscribeFromAlarms()
      this.token = null
      this.isInitialized = false
      this.messageHandlers = []
      console.log('🧹 Servicio FCM limpiado')
    } catch (error) {
      console.error('❌ Error limpiando FCM:', error)
    }
  }
}

// Instancia singleton del servicio
export const fcmService = new FCMService()
