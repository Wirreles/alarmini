#!/bin/bash

echo "🚀 Configurando entorno de distribución..."

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📦 Node.js version: $NODE_VERSION"

# Install dependencies
echo "📥 Instalando dependencias..."
npm install

# Install Capacitor CLI globally if not present
if ! command -v cap &> /dev/null; then
    echo "⚙️ Instalando Capacitor CLI..."
    npm install -g @capacitor/cli
fi

# Initialize Capacitor if not already done
if [ ! -f "capacitor.config.json" ]; then
    echo "🔧 Inicializando Capacitor..."
    npx cap init "Alarma Compartida" "com.sharedalarm.app" --web-dir=out
fi

# Create necessary directories
echo "📁 Creando directorios..."
mkdir -p dist
mkdir -p res/android
mkdir -p res/ios

# Check for Android SDK
if [ -d "$ANDROID_HOME" ]; then
    echo "✅ Android SDK encontrado: $ANDROID_HOME"
else
    echo "⚠️ Android SDK no encontrado. Instalar Android Studio para builds de Android."
fi

# Check for Xcode (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v xcodebuild &> /dev/null; then
        XCODE_VERSION=$(xcodebuild -version | head -n 1)
        echo "✅ Xcode encontrado: $XCODE_VERSION"
    else
        echo "⚠️ Xcode no encontrado. Instalar desde App Store para builds de iOS."
    fi
else
    echo "ℹ️ No es macOS - builds de iOS no disponibles"
fi

# Create example environment file
if [ ! -f ".env.local" ]; then
    echo "📝 Creando archivo de ejemplo .env.local..."
    cp .env.example .env.local
    echo "⚠️ Configurar variables de entorno en .env.local antes de construir"
fi

echo "✅ Configuración de distribución completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar variables de entorno en .env.local"
echo "2. Desplegar Firebase Functions"
echo "3. Ejecutar: npm run distribute"
echo ""
echo "📖 Ver DISTRIBUTION.md para instrucciones detalladas"
