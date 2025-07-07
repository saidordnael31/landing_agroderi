import { type NextRequest, NextResponse } from "next/server"
import { supabase, logEvent } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const { email, walletAddress, step, proof } = await request.json()

    // Validações básicas
    if (!email || !walletAddress || !step) {
      return NextResponse.json({ error: "Email, carteira e passo são obrigatórios" }, { status: 400 })
    }

    // Validar formato da carteira
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: "Formato de carteira inválido" }, { status: 400 })
    }

    // Buscar missão existente ou criar nova
    let { data: mission, error } = await supabase
      .from("missions")
      .select("*")
      .eq("user_email", email.toLowerCase())
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: "Erro ao buscar missão" }, { status: 500 })
    }

    // Se não existe, criar nova missão
    if (!mission) {
      const { data: newMission, error: createError } = await supabase
        .from("missions")
        .insert([
          {
            user_email: email.toLowerCase(),
            wallet_address: walletAddress,
            steps_completed: [],
            status: "pending",
            reward_amount: 50.0,
            instagram_verified: false,
            youtube_verified: false,
            telegram_verified: false,
          },
        ])
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: "Erro ao criar missão" }, { status: 500 })
      }
      mission = newMission
    }

    // Verificar se o passo já foi completado
    const stepsCompleted = mission.steps_completed || []
    const stepExists = stepsCompleted.some((s: any) => s.step === step)

    if (stepExists) {
      return NextResponse.json({ error: "Este passo já foi completado" }, { status: 409 })
    }

    // Adicionar novo passo
    const newStep = {
      step,
      completed: true,
      completed_at: new Date().toISOString(),
      proof,
    }

    const updatedSteps = [...stepsCompleted, newStep]

    // Atualizar campos de verificação
    const updateData: any = {
      steps_completed: updatedSteps,
      updated_at: new Date().toISOString(),
    }

    switch (step) {
      case "instagram":
        updateData.instagram_verified = true
        break
      case "youtube":
        updateData.youtube_verified = true
        break
      case "telegram":
        updateData.telegram_verified = true
        break
    }

    // Verificar se todas as etapas foram completadas
    const requiredSteps = ["instagram", "youtube", "telegram"]
    const completedStepNames = updatedSteps.map((s: any) => s.step)
    const allCompleted = requiredSteps.every((step) => completedStepNames.includes(step))

    if (allCompleted && mission.status === "pending") {
      updateData.status = "completed"
    }

    // Atualizar missão
    const { data: updatedMission, error: updateError } = await supabase
      .from("missions")
      .update(updateData)
      .eq("id", mission.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Erro ao atualizar missão" }, { status: 500 })
    }

    // Log do evento
    await logEvent({
      event_name: "mission_step_completed",
      event_data: {
        email,
        step,
        wallet_address: walletAddress,
        all_completed: allCompleted,
      },
      ip_address: request.ip,
    })

    return NextResponse.json({
      success: true,
      message: `Passo "${step}" completado com sucesso!`,
      data: {
        mission: updatedMission,
        steps_completed: updatedSteps.length,
        total_steps: requiredSteps.length,
        all_completed: allCompleted,
        reward_amount: allCompleted ? mission.reward_amount : 0,
      },
    })
  } catch (error) {
    console.error("Erro ao submeter missão:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    const { data: mission, error } = await supabase
      .from("missions")
      .select("*")
      .eq("user_email", email.toLowerCase())
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: "Erro ao buscar missão" }, { status: 500 })
    }

    // Se não existe missão, retornar estado inicial
    if (!mission) {
      return NextResponse.json({
        success: true,
        data: {
          exists: false,
          steps_completed: [],
          status: "not_started",
          instagram_verified: false,
          youtube_verified: false,
          telegram_verified: false,
          reward_amount: 50.0,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        exists: true,
        ...mission,
        steps_completed_count: mission.steps_completed?.length || 0,
        total_steps: 3,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar status da missão:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
