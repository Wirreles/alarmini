# Configuración Completa de Firebase para Alarma Compartida

## 🚨 Problema Actual
La aplicación actualmente solo funciona localmente (entre pestañas del mismo navegador). Para que las alarmas se sincronicen entre dispositivos móviles y web, necesitamos configurar Firebase Cloud Messaging (FCM).

## 🔧 Pasos para Configurar Firebase

### 1. Crear Proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombre del proyecto: `alarmini` (o el que prefieras)
4. Habilita Google Analytics (opcional)
5. Crea el proyecto

### 2. Configurar Cloud Messaging
1. En Firebase Console, ve a "Configuración del proyecto" (⚙️)
2. Haz clic en la pestaña "Cloud Messaging"
3. Anota el **Server key** y **Sender ID**
4. Haz clic en "Generar par de claves" para obtener la **VAPID key**

### 3. Configurar Cloud Functions
1. Instala Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Inicia sesión:
   ```bash
   firebase login
   ```

3. Inicializa las funciones:
   ```bash
   cd functions
   npm install
   npm run build
   ```

4. Despliega las funciones:
   ```bash
   firebase deploy --only functions
   ```

5. Anota las URLs de las funciones desplegadas

### 4. Actualizar Configuración
1. **Actualiza `lib/firebase-config.js`:**
   ```javascript
   export const firebaseConfig = {
     apiKey: "TU-API-KEY-REAL",
     authDomain: "tu-proyecto.firebaseapp.com",
     projectId: "tu-proyecto-id",
     storageBucket: "tu-proyecto.appspot.com",
     messagingSenderId: "TU-SENDER-ID",
     appId: "TU-APP-ID",
   }

   export const API_ENDPOINTS = {
     SEND_ALARM: "https://tu-region-tu-proyecto.cloudfunctions.net/sendAlarmNotification",
     SUBSCRIBE: "https://tu-region-tu-proyecto.cloudfunctions.net/subscribeToAlarm",
     UNSUBSCRIBE: "https://tu-region-tu-proyecto.cloudfunctions.net/unsubscribeFromAlarm",
   }

   export const FCM_CONFIG = {
     vapidKey: "TU-VAPID-KEY-REAL",
     topic: "shared_alarm_global",
   }
   ```

2. **Actualiza `public/firebase-messaging-sw.js`:**
   ```javascript
   const FCM_CONFIG = {
     apiKey: "TU-API-KEY-REAL",
     authDomain: "tu-proyecto.firebaseapp.com",
     projectId: "tu-proyecto-id",
     storageBucket: "tu-proyecto.appspot.com",
     messagingSenderId: "TU-SENDER-ID",
     appId: "TU-APP-ID",
   }
   ```

### 5. Configurar Aplicación Web
1. En Firebase Console, ve a "Configuración del proyecto"
2. Haz clic en "Agregar app" y selecciona "Web"
3. Registra la app con el nombre "Alarmini Web"
4. Copia la configuración y asegúrate de que coincida con `firebase-config.js`

### 6. Configurar Aplicación Móvil (Opcional)
Si quieres crear una app móvil nativa:
1. En Firebase Console, agrega una app Android/iOS
2. Descarga el archivo de configuración (`google-services.json` o `GoogleService-Info.plist`)
3. Configura FCM en tu app móvil

## 🧪 Probar la Configuración

### 1. Verificar Conexión
- Abre la aplicación en dos dispositivos/navegadores diferentes
- Verifica que ambos muestren "Conectado al sistema de alarmas compartidas" (punto verde)
- Si solo muestra "Conectado (modo local)" (punto amarillo), FCM no está configurado correctamente

### 2. Probar Sincronización
- Activa una alarma en un dispositivo
- Verifica que se active en el otro dispositivo
- Revisa la consola del navegador para mensajes de FCM

### 3. Verificar Logs
En la consola del navegador deberías ver:
```
🚀 Inicializando servicio FCM...
✅ Servicio FCM inicializado
🔑 Token FCM obtenido: [token]...
📱 Suscribiendo a alarmas...
✅ Suscrito a alarmas
```

## 🚨 Solución de Problemas

### Error: "FCM no disponible, usando modo local"
- Verifica que las Cloud Functions estén desplegadas
- Confirma que las URLs en `API_ENDPOINTS` sean correctas
- Revisa que el proyecto Firebase esté activo

### Error: "No se pudo obtener token FCM"
- Verifica que la VAPID key sea correcta
- Confirma que el service worker esté registrado
- Revisa que los permisos de notificación estén habilitados

### Error: "Error enviando alarma por FCM"
- Verifica que la función `sendAlarmNotification` esté desplegada
- Confirma que el tópico `shared_alarm_global` esté configurado
- Revisa los logs de Cloud Functions en Firebase Console

## 📱 Funcionalidades Implementadas

### ✅ Completado
- [x] Servicio FCM para sincronización entre dispositivos
- [x] Cloud Functions para envío de alarmas
- [x] Service Worker para notificaciones push
- [x] Fallback a modo local si FCM falla
- [x] Manejo de permisos de notificación
- [x] Interfaz de usuario actualizada

### 🔄 Funcionamiento
1. **Usuario A** activa alarma → FCM envía notificación a todos los dispositivos
2. **Usuario B** recibe notificación → Se activa alarma local automáticamente
3. **Usuario C** recibe notificación → Se activa alarma local automáticamente
4. **Todos los usuarios** ven la alarma activarse simultáneamente

## 🎯 Resultado Esperado
Después de la configuración, cuando un usuario active la alarma:
- ✅ Se activará en su propio dispositivo
- ✅ Se enviará a todos los dispositivos conectados vía FCM
- ✅ Se activará automáticamente en todos los dispositivos
- ✅ Funcionará tanto en web como en móvil
- ✅ Las alarmas serán verdaderamente compartidas entre todos los usuarios

## 📞 Soporte
Si tienes problemas con la configuración:
1. Revisa los logs en la consola del navegador
2. Verifica que todas las configuraciones de Firebase sean correctas
3. Asegúrate de que las Cloud Functions estén desplegadas
4. Confirma que los permisos de notificación estén habilitados
