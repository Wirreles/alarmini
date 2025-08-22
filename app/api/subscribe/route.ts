import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("📱 API Route: Suscribiendo dispositivo...")

    const { token } = await request.json()

    console.log("🔑 Token FCM recibido:", token ? `${token.substring(0, 20)}...` : "No token")

    if (!token) {
      console.log("❌ Token FCM faltante")
      return NextResponse.json({ error: "FCM token is required" }, { status: 400 })
    }

    // Simular suscripción exitosa por ahora
    // TODO: Implementar suscripción real cuando las Cloud Functions estén desplegadas
    console.log("✅ Dispositivo suscrito exitosamente (simulado)")

    const response = {
      success: true,
      message: "Device subscribed to alarm notifications",
      topic: "shared_alarm_global",
      note: "Simulación - Cloud Functions no desplegadas aún",
    }

    console.log("📤 Respuesta:", response)

    return NextResponse.json(response)
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
