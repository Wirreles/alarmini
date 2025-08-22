import { type NextRequest, NextResponse } from "next/server"

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

    // Simular envío exitoso por ahora
    // TODO: Implementar FCM real cuando las Cloud Functions estén desplegadas
    console.log("✅ Alarma simulada enviada exitosamente")

    const response = {
      success: true,
      messageId: `sim_${Date.now()}`,
      type: type,
      timestamp: Date.now(),
      note: "Simulación - Cloud Functions no desplegadas aún",
    }

    console.log("📤 Respuesta:", response)

    return NextResponse.json(response)
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
