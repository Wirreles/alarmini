# 🚨 Alarma Compartida (Alarmini)

Una aplicación web y móvil para activar alarmas de emergencia que se sincronizan entre todos los dispositivos conectados en tiempo real.

## ✨ Características

- 🚨 **Alarmas Compartidas**: Cuando un usuario activa la alarma, se activa en TODOS los dispositivos conectados
- 📱 **Multiplataforma**: Funciona en navegadores web y dispositivos móviles
- 🔊 **Múltiples Tipos**: Alarma de sonido o vibración
- 🔔 **Notificaciones Push**: Recibe alertas incluso cuando la app está cerrada
- ⚡ **Tiempo Real**: Sincronización instantánea entre dispositivos
- 🛡️ **Fallback Local**: Funciona localmente si la conexión FCM falla

## 🚀 Funcionamiento

### Antes (Solo Local)
- ❌ Las alarmas solo funcionaban entre pestañas del mismo navegador
- ❌ No había sincronización entre dispositivos móviles y web
- ❌ Cada usuario tenía su propia alarma independiente

### Ahora (Compartido Global)
- ✅ **Usuario A** activa alarma → Se envía a TODOS los dispositivos vía FCM
- ✅ **Usuario B** recibe notificación → Se activa alarma automáticamente
- ✅ **Usuario C** recibe notificación → Se activa alarma automáticamente
- ✅ **Todos los usuarios** ven la alarma activarse simultáneamente

## 🛠️ Tecnologías

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Firebase Cloud Functions
- **Notificaciones**: Firebase Cloud Messaging (FCM)
- **UI**: Shadcn/ui, Tailwind CSS
- **PWA**: Service Workers, Web App Manifest

## 📱 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/alarmini.git
cd alarmini
npm install
```

### 2. Configuración (Opcional)
La aplicación funciona inmediatamente con sincronización local. Para sincronización entre dispositivos:
- **Solución Gratuita**: Usa la implementación WebSocket incluida (recomendado)
- **Solución Firebase**: Sigue [FIREBASE_SETUP_COMPLETE.md](./FIREBASE_SETUP_COMPLETE.md) si prefieres usar Firebase

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

### 4. Probar la sincronización
```bash
# Verificar estado del servidor
curl http://localhost:3000/api/websocket

# Abrir en múltiples dispositivos/navegadores
# Activar alarma en uno y verificar que se active en los demás
```

## 🔧 Configuración

### **Solución Gratuita (Recomendada)**
No necesitas configurar nada. La aplicación funciona inmediatamente con sincronización entre dispositivos usando WebSockets.

### **Solución Firebase (Opcional)**
Si prefieres usar Firebase, crea un archivo `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=tu-vapid-key
```

Y actualiza `lib/firebase-config.js` con tus valores reales.

## 🧪 Pruebas

### Script de Prueba WebSocket
```bash
# Verificar estado del servidor
curl http://localhost:3000/api/websocket

# Ver dispositivos conectados
curl -X POST http://localhost:3000/api/websocket \
  -H "Content-Type: application/json" \
  -d '{"action": "getStatus", "deviceId": "test"}'
```

### Pruebas Manuales
1. Abre la app en dos dispositivos diferentes
2. Verifica que ambos muestren "Conectado al sistema de alarmas compartidas" (punto verde)
3. Activa una alarma en un dispositivo
4. Verifica que se active automáticamente en el otro dispositivo

## 📊 Estado de la Aplicación

La interfaz muestra el estado actual:
- 🟢 **Verde**: Conectado al sistema de alarmas compartidas (FCM funcionando)
- 🟡 **Amarillo**: Conectado (modo local) - FCM no disponible
- 🔴 **Rojo**: No conectado - Permisos pendientes

## 🚨 Solución de Problemas

### FCM no funciona
1. Verifica que las Cloud Functions estén desplegadas
2. Confirma que la configuración de Firebase sea correcta
3. Revisa que los permisos de notificación estén habilitados
4. Ejecuta `node scripts/test-fcm.js` para diagnosticar

### Solo funciona localmente
- FCM no está configurado correctamente
- Sigue las instrucciones en `FIREBASE_SETUP_COMPLETE.md`
- Verifica los logs en la consola del navegador

### Errores de permisos
- Habilita las notificaciones en el navegador
- Verifica que el service worker esté registrado
- Confirma que la app tenga permisos de vibración (en móvil)

## 📚 Documentación

- [Configuración SIN Firebase (Recomendada)](./SETUP_SIN_FIREBASE.md)
- [Configuración con Firebase (Opcional)](./FIREBASE_SETUP_COMPLETE.md)
- [Solución de Problemas](./TROUBLESHOOTING.md)
- [Distribución](./DISTRIBUTION.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas:
1. Revisa la documentación en `FIREBASE_SETUP_COMPLETE.md`
2. Ejecuta el script de pruebas: `node scripts/test-fcm.js`
3. Revisa los logs en la consola del navegador
4. Abre un issue en GitHub

---

**¡Con Alarma Compartida, nunca estarás solo en una emergencia! 🚨✨**