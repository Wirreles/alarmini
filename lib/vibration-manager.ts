export class VibrationManager {
  private isVibrating = false
  private vibrationTimeout: NodeJS.Timeout | null = null
  private hasUserInteracted = false

  // Check if vibration is supported
  get isSupported(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      console.log("📳 Vibración no disponible (servidor)")
      return false
    }
    const supported = "vibrate" in navigator
    console.log("📳 Soporte de vibración:", supported)
    return supported
  }

  // Check if user has interacted with the page (required for vibration)
  private checkUserInteraction(): boolean {
    console.log("👆 Verificando interacción del usuario:", this.hasUserInteracted)
    return this.hasUserInteracted
  }

  // Mark that user has interacted (call this on first user action)
  markUserInteraction() {
    console.log("👆 Marcando interacción del usuario")
    this.hasUserInteracted = true
  }

  // Emergency alarm vibration pattern (long, urgent)
  private readonly EMERGENCY_PATTERN = [
    500,
    200,
    500,
    200,
    500,
    200, // 3 long pulses
    100,
    100,
    100,
    100,
    100,
    100, // 3 short pulses
    500,
    200,
    500,
    200,
    500, // 3 long pulses again
  ]

  // Alert vibration pattern (moderate)
  private readonly ALERT_PATTERN = [300, 150, 300, 150, 300, 150, 100, 100, 100, 100, 300, 150, 300]

  // Gentle notification pattern
  private readonly GENTLE_PATTERN = [200, 100, 200, 100, 200]

  // Play vibration pattern
  async playVibrationPattern(pattern: "emergency" | "alert" | "gentle" = "emergency"): Promise<boolean> {
    console.log("📳 Intentando reproducir patrón de vibración:", pattern)

    if (!this.isSupported) {
      console.warn("⚠️ Vibración no soportada en este dispositivo")
      return false
    }

    if (!this.checkUserInteraction()) {
      console.warn("⚠️ Se requiere interacción del usuario para vibrar")
      return false
    }

    if (this.isVibrating) {
      console.log("📳 Deteniendo vibración anterior...")
      this.stopVibration()
    }

    try {
      this.isVibrating = true

      let vibrationPattern: number[]
      let duration: number

      switch (pattern) {
        case "emergency":
          vibrationPattern = this.EMERGENCY_PATTERN
          duration = 8000 // 8 seconds total
          break
        case "alert":
          vibrationPattern = this.ALERT_PATTERN
          duration = 5000 // 5 seconds total
          break
        case "gentle":
          vibrationPattern = this.GENTLE_PATTERN
          duration = 2000 // 2 seconds total
          break
        default:
          vibrationPattern = this.EMERGENCY_PATTERN
          duration = 8000
      }

      console.log("📳 Iniciando vibración con patrón:", vibrationPattern)
      console.log("⏱️ Duración total:", duration + "ms")

      // Start vibration
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const result = navigator.vibrate(vibrationPattern)
        console.log("📳 Resultado de navigator.vibrate:", result)
      } else {
        console.warn("⚠️ navigator.vibrate no disponible")
        return false
      }

      // Set timeout to stop vibration
      this.vibrationTimeout = setTimeout(() => {
        console.log("⏱️ Timeout de vibración alcanzado")
        this.isVibrating = false
        this.vibrationTimeout = null
      }, duration)

      console.log("✅ Vibración iniciada exitosamente")
      return true
    } catch (error) {
      console.error("❌ Error reproduciendo patrón de vibración:", error)
      this.isVibrating = false
      return false
    }
  }

  // Stop vibration
  stopVibration() {
    console.log("🛑 Deteniendo vibración...")

    try {
      if (this.isSupported && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(0) // Stop vibration
        console.log("📳 Vibración detenida")
      }

      if (this.vibrationTimeout) {
        clearTimeout(this.vibrationTimeout)
        this.vibrationTimeout = null
        console.log("⏱️ Timeout de vibración cancelado")
      }

      this.isVibrating = false
    } catch (error) {
      console.error("❌ Error deteniendo vibración:", error)
    }
  }

  // Test vibration functionality
  async testVibration(): Promise<boolean> {
    console.log("🧪 Probando funcionalidad de vibración...")

    if (!this.isSupported) {
      console.warn("⚠️ Vibración no soportada")
      return false
    }

    if (!this.checkUserInteraction()) {
      console.warn("⚠️ Se requiere interacción del usuario para probar vibración")
      return false
    }

    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const result = navigator.vibrate([200, 100, 200])
        console.log("🧪 Resultado de prueba de vibración:", result)
        return true
      } else {
        console.warn("⚠️ navigator.vibrate no disponible para prueba")
        return false
      }
    } catch (error) {
      console.error("❌ Prueba de vibración falló:", error)
      return false
    }
  }

  // Get vibration status
  get isActive(): boolean {
    return this.isVibrating
  }
}

// Singleton instance
export const vibrationManager = new VibrationManager()

// Auto-mark user interaction on common events
if (typeof window !== "undefined") {
  const markInteraction = () => {
    console.log("👆 Auto-marcando interacción del usuario")
    vibrationManager.markUserInteraction()
  }

  // Listen for user interactions
  window.addEventListener("click", markInteraction, { once: true })
  window.addEventListener("touchstart", markInteraction, { once: true })
  window.addEventListener("keydown", markInteraction, { once: true })
}
