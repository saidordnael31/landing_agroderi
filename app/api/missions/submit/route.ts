import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, wallet, stepsCompleted } = await request.json()

    // Validar dados
    if (!email || !wallet || !stepsCompleted) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    // Verificar se já existe missão para este email
    const { data: existingMission } = await supabase.from("missions").select("*").eq("user_email", email).single()

    if (existingMission) {
      return NextResponse.json({ error: "Missão já foi enviada para este email" }, { status: 400 })
    }

    // Criar nova missão
    const { data: mission, error } = await supabase
      .from("missions")
      .insert({
        user_email: email,
        wallet_address: wallet,
        steps_completed: stepsCompleted,
        status: "pending",
        reward_amount: 50,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Erro ao salvar missão: " + error.message }, { status: 400 })
    }

    // Enviar email de confirmação (implementar depois)
    // await sendMissionConfirmationEmail(email, wallet)

    return NextResponse.json({
      success: true,
      mission,
      message: "Missão enviada com sucesso! Tokens serão enviados em até 24h.",
    })
  } catch (error) {
    console.error("Erro ao enviar missão:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
