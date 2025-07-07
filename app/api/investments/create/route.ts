import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import { INVESTMENT_PLANS, calculateInvestmentBonus } from "@/lib/business-rules"

export async function POST(request: NextRequest) {
  try {
    const { planId, amount, userEmail, userName, userPhone, affiliateCode, paymentMethod } = await request.json()

    // Validar plano
    const plan = INVESTMENT_PLANS.find((p) => p.id === planId)
    if (!plan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 400 })
    }

    // Validar valor
    if (amount < plan.minValue || (plan.maxValue && amount > plan.maxValue)) {
      return NextResponse.json(
        {
          error: `Valor deve estar entre R$ ${plan.minValue.toLocaleString()} e R$ ${plan.maxValue?.toLocaleString() || "ilimitado"}`,
        },
        { status: 400 },
      )
    }

    // Buscar ou criar usuário
    let user
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", userEmail.toLowerCase())
      .single()

    if (existingUser) {
      user = existingUser
    } else {
      // Criar novo usuário
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          email: userEmail.toLowerCase(),
          name: userName,
          phone: userPhone,
          role: "buyer",
          status: "active",
        })
        .select()
        .single()

      if (userError) {
        console.error("Erro ao criar usuário:", userError)
        return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 400 })
      }
      user = newUser
    }

    // Buscar afiliado se código fornecido
    let affiliateId = null
    if (affiliateCode) {
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("id, status")
        .eq("affiliate_code", affiliateCode.toUpperCase())
        .eq("status", "active")
        .single()

      if (affiliate) {
        affiliateId = affiliate.id
      }
    }

    // Calcular bônus
    const bonusData = calculateInvestmentBonus(planId, amount, !!affiliateId)

    // Calcular data de desbloqueio
    const unlockDate = new Date()
    unlockDate.setDate(unlockDate.getDate() + plan.lockPeriod)

    // Criar investimento
    const { data: investment, error: investmentError } = await supabase
      .from("investments")
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount,
        bonus: bonusData.bonus,
        affiliate_bonus: bonusData.affiliateBonus,
        affiliate_id: affiliateId,
        unlock_date: unlockDate.toISOString(),
        payment_method: paymentMethod || "pix",
        transaction_id: `TXN_${Date.now()}`,
        status: "pending",
      })
      .select()
      .single()

    if (investmentError) {
      console.error("Erro ao criar investimento:", investmentError)
      return NextResponse.json({ error: "Erro ao criar investimento" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      investment: {
        id: investment.id,
        amount: investment.amount,
        bonus: investment.bonus,
        plan: plan.name,
        unlockDate: investment.unlock_date,
      },
      redirectUrl: "https://www.agroderi.in",
      message: "Investimento criado com sucesso!",
    })
  } catch (error) {
    console.error("Erro ao criar investimento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
