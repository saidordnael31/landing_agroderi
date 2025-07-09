import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📥 Dados da missão:", body)

    const { email, walletAddress, steps } = body

    // Validações
    if (!email || !walletAddress || !steps) {
      return NextResponse.json({ error: "Email, carteira e passos são obrigatórios" }, { status: 400 })
    }

    // Verificar se já existe missão para este email
    const { data: existingMission } = await supabaseAdmin
      .from("missions")
      .select("id")
      .eq("user_email", email.toLowerCase())
      .single()

    if (existingMission) {
      return NextResponse.json({ error: "Você já participou desta missão" }, { status: 409 })
    }

    // Calcular recompensa baseado nos passos completados
    const rewardAmount = steps.length * 10 // R$10 por passo

    // Verificar quais redes sociais foram verificadas
    const instagramVerified = steps.some((step: any) => step.type === "instagram")
    const youtubeVerified = steps.some((step: any) => step.type === "youtube")
    const telegramVerified = steps.some((step: any) => step.type === "telegram")

    // Criar missão
    const { data: mission, error: missionError } = await supabaseAdmin
      .from("missions")
      .insert({
        user_email: email.toLowerCase(),
        wallet_address: walletAddress,
        steps_completed: steps,
        status: "completed",
        reward_amount: rewardAmount,
        instagram_verified: instagramVerified,
        youtube_verified: youtubeVerified,
        telegram_verified: telegramVerified,
      })
      .select("id, reward_amount, status")
      .single()

    if (missionError) {
      console.error("Erro ao criar missão:", missionError)
      return NextResponse.json({ error: "Erro ao salvar missão" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      missionId: mission.id,
      rewardAmount: mission.reward_amount,
      status: mission.status,
      message: "Missão completada com sucesso!",
    })
  } catch (error) {
    console.error("Erro na API de missões:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
