export class AudioManager {
  private audioContext: AudioContext | null = null
  private alarmSound: HTMLAudioElement | null = null
  private isPlaying = false

  constructor() {
    this.initializeAudio()
  }

  private async initializeAudio() {
    try {
      // Initialize Web Audio API for better control
      if ("AudioContext" in window || "webkitAudioContext" in window) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      // Create alarm sound element
      this.alarmSound = new Audio()
      this.alarmSound.preload = "auto"
      this.alarmSound.loop = false

      // Set volume to maximum
      this.alarmSound.volume = 1.0

      // Handle audio events
      this.alarmSound.addEventListener("ended", () => {
        this.isPlaying = false
      })

      this.alarmSound.addEventListener("error", (e) => {
        console.error("Audio error:", e)
        this.isPlaying = false
      })
    } catch (error) {
      console.error("Error initializing audio:", error)
    }
  }

  // Generate alarm tone using Web Audio API
  private generateAlarmTone(frequency = 800, duration = 1000): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audioContext) {
        resolve()
        return
      }

      try {
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)

        // Create alarm pattern: alternating frequencies
        oscillator.type = "square"
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
        oscillator.frequency.setValueAtTime(frequency * 1.5, this.audioContext.currentTime + 0.5)

        // Volume envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1)
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + duration / 1000 - 0.1)
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration / 1000)

        oscillator.start(this.audioContext.currentTime)
        oscillator.stop(this.audioContext.currentTime + duration / 1000)

        oscillator.onended = () => resolve()
      } catch (error) {
        console.error("Error generating alarm tone:", error)
        resolve()
      }
    })
  }

  // Play alarm sound with multiple attempts
  async playAlarmSound(): Promise<boolean> {
    if (this.isPlaying) {
      return true
    }

    try {
      this.isPlaying = true

      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume()
      }

      // Try to play generated tone first (more reliable)
      await this.generateAlarmTone(800, 2000)

      // Play additional tones for emphasis
      setTimeout(() => this.generateAlarmTone(1000, 1500), 500)
      setTimeout(() => this.generateAlarmTone(600, 1500), 1000)

      return true
    } catch (error) {
      console.error("Error playing alarm sound:", error)
      this.isPlaying = false
      return false
    }
  }

  // Stop all alarm sounds
  stopAlarmSound() {
    try {
      if (this.alarmSound && !this.alarmSound.paused) {
        this.alarmSound.pause()
        this.alarmSound.currentTime = 0
      }
      this.isPlaying = false
    } catch (error) {
      console.error("Error stopping alarm sound:", error)
    }
  }

  // Test audio functionality
  async testAudio(): Promise<boolean> {
    try {
      await this.generateAlarmTone(440, 500)
      return true
    } catch (error) {
      console.error("Audio test failed:", error)
      return false
    }
  }
}

// Singleton instance
export const audioManager = new AudioManager()
