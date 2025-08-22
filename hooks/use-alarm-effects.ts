"use client"

import { useCallback, useRef, useEffect } from "react"
import { audioManager } from "@/lib/audio-manager"
import { vibrationManager } from "@/lib/vibration-manager"

interface AlarmEffectsOptions {
  enableAudio?: boolean
  enableVibration?: boolean
  intensity?: "gentle" | "alert" | "emergency"
}

export const useAlarmEffects = (options: AlarmEffectsOptions = {}) => {
  const { enableAudio = true, enableVibration = true, intensity = "emergency" } = options

  const isPlayingRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Play alarm effects
  const playAlarmEffects = useCallback(
    async (type: "sound" | "vibrate" | "both" = "both") => {
      if (isPlayingRef.current) {
        return false
      }

      isPlayingRef.current = true

      try {
        const promises: Promise<boolean>[] = []

        // Play sound if requested and enabled
        if ((type === "sound" || type === "both") && enableAudio) {
          promises.push(audioManager.playAlarmSound())
        }

        // Play vibration if requested and enabled
        if ((type === "vibrate" || type === "both") && enableVibration) {
          promises.push(vibrationManager.playVibrationPattern(intensity))
        }

        const results = await Promise.all(promises)
        const success = results.some((result) => result)

        // Auto-stop after maximum duration
        timeoutRef.current = setTimeout(() => {
          stopAlarmEffects()
        }, 10000) // 10 seconds maximum

        return success
      } catch (error) {
        console.error("Error playing alarm effects:", error)
        isPlayingRef.current = false
        return false
      }
    },
    [enableAudio, enableVibration, intensity],
  )

  // Stop alarm effects
  const stopAlarmEffects = useCallback(() => {
    try {
      audioManager.stopAlarmSound()
      vibrationManager.stopVibration()

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      isPlayingRef.current = false
    } catch (error) {
      console.error("Error stopping alarm effects:", error)
    }
  }, [])

  // Test alarm effects
  const testAlarmEffects = useCallback(
    async (type: "sound" | "vibrate" | "both" = "both") => {
      try {
        const promises: Promise<boolean>[] = []

        if ((type === "sound" || type === "both") && enableAudio) {
          promises.push(audioManager.testAudio())
        }

        if ((type === "vibrate" || type === "both") && enableVibration) {
          promises.push(vibrationManager.testVibration())
        }

        const results = await Promise.all(promises)
        return results.some((result) => result)
      } catch (error) {
        console.error("Error testing alarm effects:", error)
        return false
      }
    },
    [enableAudio, enableVibration],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlarmEffects()
    }
  }, [stopAlarmEffects])

  return {
    playAlarmEffects,
    stopAlarmEffects,
    testAlarmEffects,
    isPlaying: isPlayingRef.current,
    audioSupported: true, // Web Audio API is widely supported
    vibrationSupported: vibrationManager.isSupported,
  }
}
