import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { INVESTMENT_PLANS, calculateInvestmentBonus } from "@/lib/business-rules"

export async function POST(request: NextRequest) {
  try {
    const { userId, planId, amount, affiliateId, paymentMethod } = await request.json()

    // Validar plano
    const plan = INVESTMENT_PLANS.find((p) => p.id === planId)
    if (!plan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 400 })
    }

    // Validar valor
    if (amount < plan.minValue || (plan.maxValue && amount > plan.maxValue)) {
      return NextResponse.json({ error: "Valor fora dos limites do plano" }, { status: 400 })
    }

    // Calcular bônus
    const bonusData = calculateInvestmentBonus(planId, amount, !!affiliateId)

    // Calcular data de desbloqueio
    const unlockDate = new Date()
    unlockDate.setDate(unlockDate.getDate() + plan.lockPeriod)

    // Criar investimento
    const { data: investment, error } = await supabase
      .from("investments")
      .insert({
        user_id: userId,
        plan_id: planId,
        amount,
        bonus: bonusData.bonus,
        affiliate_bonus: bonusData.affiliateBonus,
        affiliate_id: affiliateId,
        unlock_date: unlockDate.toISOString(),
        payment_method: paymentMethod,
        transaction_id: `TXN_${Date.now()}`,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Erro ao criar investimento: " + error.message }, { status: 400 })
    }

    // Se há afiliado, criar comissão
    if (affiliateId) {
      const commissionAmount = (amount * 7) / 100 // 7% de comissão

      await supabase.from("commissions").insert({
        affiliate_id: affiliateId,
        investment_id: investment.id,
        amount: commissionAmount,
        percentage: 7,
        status: "pending",
      })
    }

    return NextResponse.json({
      success: true,
      investment,
      redirectUrl: "https://www.agroderi.in",
    })
  } catch (error) {
    console.error("Erro ao criar investimento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
