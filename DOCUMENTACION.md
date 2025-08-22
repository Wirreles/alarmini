# 🚨 Alarma Compartida - Documentación

## 📱 **Descripción del Proyecto**

Aplicación web de alarmas compartidas que permite a múltiples dispositivos conectarse y activar alarmas que se reproducen en tiempo real en todos los dispositivos conectados.

## 🏗️ **Arquitectura del Sistema**

### **Frontend (Next.js)**
- **Página principal**: Interfaz para activar alarmas
- **Página de debug**: Monitoreo en tiempo real del sistema
- **Hook personalizado**: `useNotifications` para gestión de alarmas
- **Servicio WebSocket**: Comunicación en tiempo real

### **Backend (API Routes)**
- **`/api/websocket`**: Endpoint principal para sincronización
- **Gestión de conexiones**: Mantiene registro de dispositivos conectados
- **Historial de alarmas**: Almacena alarmas recientes para sincronización

## 🔧 **Componentes Principales**

### **1. Hook `useNotifications`**
```typescript
const {
  isReady,           // Estado de preparación
  isConnected,       // Estado de conexión WebSocket
  error,            // Mensajes de error
  enableNotifications, // Habilitar notificaciones
  triggerAlarm,     // Activar alarma
  clearError        // Limpiar errores
} = useNotifications()
```

### **2. Servicio WebSocket**
```typescript
// Conectar al sistema
await websocketService.connect()

// Enviar alarma
await websocketService.sendAlarm({ type: 'sound' })

// Estado de conexión
websocketService.getConnectionStatus()
```

### **3. Efectos de Alarma**
```typescript
// Reproducir efectos
playAlarmEffects('sound')    // Solo sonido
playAlarmEffects('vibrate')  // Solo vibración
playAlarmEffects('both')     // Ambos
```

## 🚀 **Funcionamiento del Sistema**

### **1. Conexión Inicial**
1. Usuario abre la aplicación
2. Se solicita permiso de notificaciones
3. Se conecta automáticamente al WebSocket
4. Se muestra estado "Conectado al sistema de alarmas compartidas"

### **2. Activación de Alarma**
1. Usuario presiona "ACTIVAR ALARMA"
2. Se envía alarma por WebSocket a todos los dispositivos
3. Se reproduce localmente en el dispositivo que la activó
4. Se recibe en otros dispositivos y se reproduce automáticamente

### **3. Sincronización en Tiempo Real**
- **Polling cada 3 segundos**: Verifica nuevas alarmas
- **Timestamp tracking**: Evita procesar alarmas duplicadas
- **Reconexión automática**: Se reconecta si se pierde la conexión

## 📱 **Páginas de la Aplicación**

### **Página Principal (`/`)**
- Botón de activación de alarma
- Selector de tipo de alarma (Sonido/Vibración)
- Estado de conexión
- Gestión de permisos

### **Página de Debug (`/debug`)**
- Estado del servidor en tiempo real
- Lista de dispositivos conectados
- Historial de alarmas
- Pruebas de sincronización

## 🛠️ **Configuración y Despliegue**

### **Desarrollo Local**
```bash
npm install
npm run dev
```

### **Despliegue en Vercel**
1. Push al repositorio
2. Vercel se despliega automáticamente
3. La sincronización funciona igual que en desarrollo

## 🔍 **Solución de Problemas**

### **Alarma no suena en otros dispositivos**
1. Verificar que ambos dispositivos muestren punto verde
2. Revisar la página `/debug` para confirmar conexiones
3. Verificar logs en la consola del navegador

### **Error de conexión**
1. Verificar que el servidor esté ejecutándose
2. Revisar permisos de notificaciones
3. Limpiar caché del navegador

## 📊 **Características Técnicas**

- **Framework**: Next.js 14 con App Router
- **Estado**: React Hooks (useState, useEffect, useCallback)
- **Comunicación**: WebSocket simulado con HTTP polling
- **UI**: Shadcn/ui + Tailwind CSS
- **Audio**: Web Audio API nativa
- **Vibración**: Navigator Vibration API

## 🎯 **Casos de Uso**

### **Emergencias**
- Alerta rápida a todos los dispositivos conectados
- Notificación inmediata con sonido y vibración
- Confirmación visual del estado de conexión

### **Monitoreo**
- Página de debug para administradores
- Estado en tiempo real de todas las conexiones
- Historial completo de alarmas activadas

## 🔒 **Seguridad y Privacidad**

- **Sin almacenamiento persistente**: Las alarmas no se guardan permanentemente
- **Conexiones temporales**: Los dispositivos se desconectan automáticamente
- **Sin datos personales**: Solo IDs de dispositivo temporales
- **Comunicación local**: Funciona en red local sin internet

---

**¡Sistema de alarmas compartidas funcionando perfectamente! 🚨✨**
