import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const { email, wallet, stepsCompleted } = await request.json()

    // Validar dados
    if (!email || !wallet || !Array.isArray(stepsCompleted)) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    // Validar formato da wallet (Ethereum address)
    const walletRegex = /^0x[a-fA-F0-9]{40}$/
    if (!walletRegex.test(wallet)) {
      return NextResponse.json({ error: "Endereço de wallet inválido" }, { status: 400 })
    }

    // Verificar se já existe missão para este email
    const { data: existingMission } = await supabase
      .from("missions")
      .select("*")
      .eq("user_email", email.toLowerCase())
      .single()

    if (existingMission) {
      return NextResponse.json(
        {
          error: "Missão já foi enviada para este email",
          status: existingMission.status,
        },
        { status: 400 },
      )
    }

    // Determinar status baseado nos passos completados
    const requiredSteps = ["follow_instagram", "share_story"]
    const completedRequiredSteps = requiredSteps.filter((step) => stepsCompleted.includes(step))

    const status = completedRequiredSteps.length >= 2 ? "completed" : "pending"
    const rewardAmount = status === "completed" ? 50 : 25

    // Criar nova missão
    const { data: mission, error } = await supabase
      .from("missions")
      .insert({
        user_email: email.toLowerCase(),
        wallet_address: wallet,
        steps_completed: stepsCompleted,
        status,
        reward_amount: rewardAmount,
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao salvar missão:", error)
      return NextResponse.json({ error: "Erro ao salvar missão" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      mission: {
        id: mission.id,
        status: mission.status,
        reward: mission.reward_amount,
        stepsCompleted: mission.steps_completed,
      },
      message:
        status === "completed"
          ? "Missão completada! Tokens serão enviados em até 24h."
          : "Missão parcialmente completada. Complete todos os passos para receber a recompensa total.",
    })
  } catch (error) {
    console.error("Erro ao enviar missão:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
