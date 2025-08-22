import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("📱 API Route: Desuscribiendo dispositivo...")

    const { token } = await request.json()

    console.log("🔑 Token FCM recibido:", token ? `${token.substring(0, 20)}...` : "No token")

    if (!token) {
      console.log("❌ Token FCM faltante")
      return NextResponse.json({ error: "FCM token is required" }, { status: 400 })
    }

    // Simular desuscripción exitosa por ahora
    console.log("✅ Dispositivo desuscrito exitosamente (simulado)")

    const response = {
      success: true,
      message: "Device unsubscribed from alarm notifications",
      topic: "shared_alarm_global",
      note: "Simulación - Cloud Functions no desplegadas aún",
    }

    console.log("📤 Respuesta:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Error en API route unsubscribe:", error)
    return NextResponse.json(
      {
        error: "Failed to unsubscribe from alarm topic",
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
