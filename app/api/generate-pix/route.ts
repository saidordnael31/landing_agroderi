import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf, value } = body

    // Validação básica
    if (!cpf || !value) {
      return NextResponse.json({ error: "CPF e valor são obrigatórios" }, { status: 400 })
    }

    console.log("🔄 [PIX_PROXY] Gerando código PIX:", { cpf, value })

    // Fazer a requisição para a API externa
    const response = await fetch("https://api.agroderivative.tech/api/generate-fiat-deposit-qrcode/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
        Accept: "application/json",
      },
      body: JSON.stringify({
        cpf: cpf,
        value: value.toString(),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("❌ [PIX_PROXY] Erro na API externa:", data)
      return NextResponse.json({ error: data, details: data }, { status: response.status })
    }

    console.log("✅ [PIX_PROXY] Código PIX gerado com sucesso")
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ [PIX_PROXY] Erro interno:", error)
    return NextResponse.json({ error: error.message}, { status: 500 })
  }
}
