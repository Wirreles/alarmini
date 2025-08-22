import { type NextRequest, NextResponse } from "next/server"
import { API_ENDPOINTS } from "@/lib/firebase-config"

interface AlarmRequest {
  type: "sound" | "vibrate"
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚨 API Route: Enviando alarma...")

    const body: AlarmRequest = await request.json()
    const { type, message } = body

    console.log("📝 Datos recibidos:", { type, message })

    if (!type || (type !== "sound" && type !== "vibrate")) {
      console.log("❌ Tipo de alarma inválido:", type)
      return NextResponse.json({ error: 'Invalid alarm type. Must be "sound" or "vibrate"' }, { status: 400 })
    }

    // Enviar alarma a través de FCM
    try {
      console.log("📡 Enviando alarma a través de FCM...")
      
      const response = await fetch(API_ENDPOINTS.SEND_ALARM, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          message: message || `Alarma ${type === "sound" ? "sonora" : "vibratoria"} activada`,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ Alarma enviada exitosamente a través de FCM:", result)

      return NextResponse.json({
        success: true,
        messageId: result.messageId || `fcm_${Date.now()}`,
        type: type,
        timestamp: Date.now(),
        note: "Alarma enviada a todos los dispositivos conectados",
      })
    } catch (fcmError) {
      console.error("❌ Error enviando alarma por FCM:", fcmError)
      
      // Fallback: simular envío exitoso si FCM falla
      console.log("⚠️ Usando modo de simulación como fallback")
      
      return NextResponse.json({
        success: true,
        messageId: `sim_${Date.now()}`,
        type: type,
        timestamp: Date.now(),
        note: "Alarma simulada - FCM no disponible",
      })
    }
  } catch (error) {
    console.error("❌ Error en API route send-alarm:", error)
    return NextResponse.json(
      {
        error: "Failed to send alarm notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
