# 📱 Guía de Distribución - Alarma Compartida

## Resumen
Esta aplicación está diseñada para distribución directa como APK (Android) e IPA (iOS), sin necesidad de publicar en App Store o Play Store.

## 🚀 Proceso de Construcción

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Para Android: Android Studio y SDK
- Para iOS: macOS con Xcode 14+

### Comandos de Construcción

#### Construcción Automática (Recomendado)
\`\`\`bash
npm run distribute
\`\`\`

#### Construcción Manual por Plataforma

**PWA (Progressive Web App)**
\`\`\`bash
npm run pwa:build
\`\`\`

**Android APK**
\`\`\`bash
npm run build:android
\`\`\`

**iOS IPA**
\`\`\`bash
npm run build:ios
\`\`\`

**Todas las plataformas**
\`\`\`bash
npm run build:all
\`\`\`

## 📦 Archivos de Distribución

### Estructura de Salida
\`\`\`
dist/
├── android/
│   ├── package-info.json
│   └── app-release.apk
├── ios/
│   ├── package-info.json
│   └── App.ipa
├── pwa/
│   ├── package-info.json
│   └── out/ (archivos web)
└── distribution-summary.json
\`\`\`

## 🤖 Distribución Android

### Generación de APK
1. El APK se genera en `android/app/build/outputs/apk/release/`
2. Archivo firmado listo para distribución
3. Tamaño aproximado: ~10MB

### Instalación
1. Habilitar "Fuentes desconocidas" en Configuración > Seguridad
2. Descargar e instalar el APK
3. Conceder permisos cuando se soliciten

### Permisos Requeridos
- `INTERNET` - Comunicación con Firebase
- `VIBRATE` - Alarmas vibratorias
- `WAKE_LOCK` - Mantener dispositivo activo
- `POST_NOTIFICATIONS` - Notificaciones push
- `FOREGROUND_SERVICE` - Funcionamiento en segundo plano

## 🍎 Distribución iOS

### Generación de IPA
1. Requiere certificado de desarrollador de Apple
2. Perfil de aprovisionamiento Ad Hoc
3. Construcción desde Xcode o línea de comandos

### Métodos de Instalación

**TestFlight (Recomendado)**
1. Subir IPA a App Store Connect
2. Invitar usuarios como beta testers
3. Instalar via app TestFlight

**Instalación Directa**
1. AltStore (requiere AltServer en PC/Mac)
2. Sideloadly
3. Perfil de empresa (si disponible)

**Perfil de Desarrollador**
1. Registrar UDIDs de dispositivos
2. Generar perfil Ad Hoc
3. Distribuir IPA firmado

## 🌐 Distribución PWA

### Instalación Web
1. Abrir URL en navegador compatible
2. Seguir prompt de instalación
3. Agregar a pantalla de inicio

### Navegadores Compatibles
- Chrome/Chromium 67+
- Firefox 79+
- Safari 14+
- Edge 79+

## 🔧 Configuración de Firebase

### Variables de Entorno Requeridas
\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
\`\`\`

### Endpoints de Functions
\`\`\`env
NEXT_PUBLIC_SEND_ALARM_ENDPOINT=https://your-region-your-project.cloudfunctions.net/sendAlarmNotification
NEXT_PUBLIC_SUBSCRIBE_ENDPOINT=https://your-region-your-project.cloudfunctions.net/subscribeToAlarm
NEXT_PUBLIC_UNSUBSCRIBE_ENDPOINT=https://your-region-your-project.cloudfunctions.net/unsubscribeFromAlarm
\`\`\`

## 📋 Lista de Verificación Pre-Distribución

### Configuración
- [ ] Variables de entorno configuradas
- [ ] Firebase Functions desplegadas
- [ ] Certificados y perfiles configurados (iOS)
- [ ] Keystore configurado (Android)

### Pruebas
- [ ] Notificaciones funcionando
- [ ] Audio y vibración operativos
- [ ] Permisos solicitados correctamente
- [ ] Funcionamiento offline
- [ ] Instalación en dispositivos reales

### Distribución
- [ ] APK firmado y probado
- [ ] IPA generado (si aplica)
- [ ] PWA accesible y funcional
- [ ] Documentación de instalación lista

## 🔄 Actualizaciones

### Proceso de Actualización
1. Incrementar versión en `package.json`
2. Actualizar `capacitor.config.json` y `config.xml`
3. Reconstruir todas las plataformas
4. Redistribuir archivos actualizados

### Notificación a Usuarios
- No hay actualizaciones automáticas
- Notificar manualmente sobre nuevas versiones
- Proporcionar nuevos archivos de instalación

## 🆘 Solución de Problemas

### Errores Comunes

**Android: "App no instalada"**
- Verificar que "Fuentes desconocidas" esté habilitado
- Desinstalar versión anterior si existe
- Verificar espacio de almacenamiento

**iOS: "No se puede verificar la app"**
- Ir a Configuración > General > Gestión de dispositivos
- Confiar en el certificado de desarrollador
- Verificar que el perfil no haya expirado

**PWA: No aparece opción de instalación**
- Usar navegador compatible
- Verificar que el sitio use HTTPS
- Comprobar que el manifest.json sea válido

### Logs y Depuración
- Android: `adb logcat`
- iOS: Console.app o Xcode
- PWA: DevTools del navegador

## 📞 Soporte

Para problemas de distribución o instalación:
1. Verificar la documentación técnica
2. Revisar logs de error
3. Contactar al equipo de desarrollo
4. Proporcionar detalles del dispositivo y error específico
