"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Volume2, Vibrate, TestTube, CheckCircle, XCircle } from "lucide-react"
import { useAlarmEffects } from "@/hooks/use-alarm-effects"

export function AlarmTestPanel() {
  const [testResults, setTestResults] = useState<{
    audio?: boolean
    vibration?: boolean
  }>({})

  const { testAlarmEffects, playAlarmEffects, stopAlarmEffects, audioSupported, vibrationSupported } = useAlarmEffects()

  const handleTestAudio = async () => {
    const result = await testAlarmEffects("sound")
    setTestResults((prev) => ({ ...prev, audio: result }))
  }

  const handleTestVibration = async () => {
    const result = await testAlarmEffects("vibrate")
    setTestResults((prev) => ({ ...prev, vibration: result }))
  }

  const handleTestBoth = async () => {
    await playAlarmEffects("both")
    setTimeout(() => stopAlarmEffects(), 3000) // Stop after 3 seconds for testing
  }

  return (
    <Card className="w-full max-w-sm p-4 bg-card border border-border">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-muted-foreground" />
          <Label className="text-base font-heading font-semibold">Pruebas de Sistema</Label>
        </div>

        <div className="space-y-3">
          {/* Audio Test */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Audio</span>
              {testResults.audio !== undefined &&
                (testResults.audio ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                ))}
            </div>
            <Button onClick={handleTestAudio} size="sm" variant="outline" disabled={!audioSupported}>
              Probar
            </Button>
          </div>

          {/* Vibration Test */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vibrate className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Vibración</span>
              {testResults.vibration !== undefined &&
                (testResults.vibration ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                ))}
            </div>
            <Button onClick={handleTestVibration} size="sm" variant="outline" disabled={!vibrationSupported}>
              Probar
            </Button>
          </div>

          {/* Full Test */}
          <div className="pt-2 border-t border-border">
            <Button onClick={handleTestBoth} size="sm" className="w-full" variant="secondary">
              Prueba Completa (3s)
            </Button>
          </div>
        </div>

        {/* Support Status */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Audio:</span>
            <span className={audioSupported ? "text-green-600" : "text-red-600"}>
              {audioSupported ? "Soportado" : "No soportado"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Vibración:</span>
            <span className={vibrationSupported ? "text-green-600" : "text-red-600"}>
              {vibrationSupported ? "Soportado" : "No soportado"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
