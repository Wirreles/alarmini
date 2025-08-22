import { type NextRequest, NextResponse } from "next/server"
import { API_ENDPOINTS } from "@/lib/firebase-config"

export async function POST(request: NextRequest) {
  try {
    console.log("📱 API Route: Suscribiendo dispositivo...")

    const { token } = await request.json()

    console.log("🔑 Token FCM recibido:", token ? `${token.substring(0, 20)}...` : "No token")

    if (!token) {
      console.log("❌ Token FCM faltante")
      return NextResponse.json({ error: "FCM token is required" }, { status: 400 })
    }

    // Suscribir dispositivo a través de FCM
    try {
      console.log("📡 Suscribiendo dispositivo a través de FCM...")
      
      const response = await fetch(API_ENDPOINTS.SUBSCRIBE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ Dispositivo suscrito exitosamente a través de FCM:", result)

      return NextResponse.json({
        success: true,
        message: "Device subscribed to alarm notifications",
        topic: result.topic || "shared_alarm_global",
        note: "Dispositivo conectado al sistema de alarmas compartidas",
      })
    } catch (fcmError) {
      console.error("❌ Error suscribiendo dispositivo por FCM:", fcmError)
      
      // Fallback: simular suscripción exitosa si FCM falla
      console.log("⚠️ Usando modo de simulación como fallback")
      
      return NextResponse.json({
        success: true,
        message: "Device subscribed to alarm notifications",
        topic: "shared_alarm_global",
        note: "Suscripción simulada - FCM no disponible",
      })
    }
  } catch (error) {
    console.error("❌ Error en API route subscribe:", error)
    return NextResponse.json(
      {
        error: "Failed to subscribe to alarm topic",
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
