const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("🚀 Iniciando proceso de distribución...\n")

// Configuration
const config = {
  appName: "Alarma Compartida",
  version: "1.0.0",
  outputDir: "dist",
  platforms: ["android", "ios", "pwa"],
}

// Create output directory
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true })
}

// Helper function to run commands
function runCommand(command, description) {
  console.log(`📦 ${description}...`)
  try {
    execSync(command, { stdio: "inherit" })
    console.log(`✅ ${description} completado\n`)
    return true
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message)
    return false
  }
}

// Build PWA
function buildPWA() {
  console.log("🌐 Construyendo PWA...")

  if (!runCommand("npm run build", "Build de Next.js")) {
    return false
  }

  // Copy PWA files
  const pwaDir = path.join(config.outputDir, "pwa")
  if (!fs.existsSync(pwaDir)) {
    fs.mkdirSync(pwaDir, { recursive: true })
  }

  // Create PWA distribution package
  const pwaPackage = {
    name: config.appName,
    version: config.version,
    type: "PWA",
    installInstructions: "Abrir en navegador y seguir instrucciones de instalación",
    files: ["out/", "public/install-instructions.html"],
  }

  fs.writeFileSync(path.join(pwaDir, "package-info.json"), JSON.stringify(pwaPackage, null, 2))

  console.log("✅ PWA lista para distribución\n")
  return true
}

// Build Android APK
function buildAndroid() {
  console.log("🤖 Construyendo APK para Android...")

  // Check if Capacitor is initialized
  if (!fs.existsSync("capacitor.config.json")) {
    console.log("⚙️ Inicializando Capacitor...")
    if (!runCommand("npx cap init", "Inicialización de Capacitor")) {
      return false
    }
  }

  // Add Android platform if not exists
  if (!fs.existsSync("android")) {
    if (!runCommand("npx cap add android", "Agregar plataforma Android")) {
      return false
    }
  }

  // Build and sync
  if (!runCommand("npm run build:android", "Build de Android")) {
    return false
  }

  // Create Android distribution info
  const androidDir = path.join(config.outputDir, "android")
  if (!fs.existsSync(androidDir)) {
    fs.mkdirSync(androidDir, { recursive: true })
  }

  const androidPackage = {
    name: config.appName,
    version: config.version,
    type: "Android APK",
    minSdkVersion: 24,
    targetSdkVersion: 34,
    permissions: [
      "INTERNET",
      "VIBRATE",
      "WAKE_LOCK",
      "RECEIVE_BOOT_COMPLETED",
      "FOREGROUND_SERVICE",
      "POST_NOTIFICATIONS",
    ],
    installInstructions: 'Habilitar "Fuentes desconocidas" e instalar APK',
    buildPath: "android/app/build/outputs/apk/release/",
  }

  fs.writeFileSync(path.join(androidDir, "package-info.json"), JSON.stringify(androidPackage, null, 2))

  console.log("✅ APK de Android listo para distribución\n")
  return true
}

// Build iOS IPA
function buildIOS() {
  console.log("🍎 Construyendo IPA para iOS...")

  // Check if running on macOS
  if (process.platform !== "darwin") {
    console.log("⚠️ La construcción de iOS requiere macOS. Saltando...\n")
    return true
  }

  // Add iOS platform if not exists
  if (!fs.existsSync("ios")) {
    if (!runCommand("npx cap add ios", "Agregar plataforma iOS")) {
      return false
    }
  }

  // Build and sync
  if (!runCommand("npm run build:ios", "Build de iOS")) {
    return false
  }

  // Create iOS distribution info
  const iosDir = path.join(config.outputDir, "ios")
  if (!fs.existsSync(iosDir)) {
    fs.mkdirSync(iosDir, { recursive: true })
  }

  const iosPackage = {
    name: config.appName,
    version: config.version,
    type: "iOS IPA",
    minimumOSVersion: "13.0",
    distributionType: "Ad Hoc",
    installInstructions: "Instalar via TestFlight, AltStore, o perfil de empresa",
    buildPath: "ios/App/build/",
    requirements: [
      "Certificado de desarrollador de Apple",
      "Perfil de aprovisionamiento Ad Hoc",
      "Xcode 14.0 o superior",
    ],
  }

  fs.writeFileSync(path.join(iosDir, "package-info.json"), JSON.stringify(iosPackage, null, 2))

  console.log("✅ IPA de iOS listo para distribución\n")
  return true
}

// Generate distribution summary
function generateSummary() {
  const summary = {
    appName: config.appName,
    version: config.version,
    buildDate: new Date().toISOString(),
    platforms: [],
    totalSize: "~15MB",
    requirements: {
      android: "Android 7.0+ (API 24)",
      ios: "iOS 13.0+",
      pwa: "Navegador moderno con soporte PWA",
    },
    features: [
      "Notificaciones push",
      "Vibración",
      "Audio de alarma",
      "Funcionamiento offline",
      "Instalación sin tiendas de apps",
    ],
    distribution: {
      method: "Distribución directa (APK/IPA)",
      installation: "Manual - No requiere App Store/Play Store",
      updates: "Manual - Redistribuir nuevas versiones",
    },
  }

  // Check which platforms were built
  if (fs.existsSync(path.join(config.outputDir, "android"))) {
    summary.platforms.push("Android APK")
  }
  if (fs.existsSync(path.join(config.outputDir, "ios"))) {
    summary.platforms.push("iOS IPA")
  }
  if (fs.existsSync(path.join(config.outputDir, "pwa"))) {
    summary.platforms.push("PWA")
  }

  fs.writeFileSync(path.join(config.outputDir, "distribution-summary.json"), JSON.stringify(summary, null, 2))

  console.log("📋 Resumen de distribución generado")
}

// Main distribution process
async function main() {
  const results = {
    pwa: false,
    android: false,
    ios: false,
  }

  // Build all platforms
  if (config.platforms.includes("pwa")) {
    results.pwa = buildPWA()
  }

  if (config.platforms.includes("android")) {
    results.android = buildAndroid()
  }

  if (config.platforms.includes("ios")) {
    results.ios = buildIOS()
  }

  // Generate summary
  generateSummary()

  // Final report
  console.log("🎉 Proceso de distribución completado!\n")
  console.log("📊 Resultados:")
  console.log(`   PWA: ${results.pwa ? "✅" : "❌"}`)
  console.log(`   Android: ${results.android ? "✅" : "❌"}`)
  console.log(`   iOS: ${results.ios ? "✅" : "❌"}`)
  console.log(`\n📁 Archivos de distribución en: ${config.outputDir}/`)
  console.log("📖 Ver distribution-summary.json para detalles completos")
}

// Run the distribution process
main().catch(console.error)
