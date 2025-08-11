import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { INVESTMENT_PLANS, calculateMonthlyCommitment, calculateInvestmentBonus } from "@/lib/business-rules"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🚀💰 [DUAL-COMMITMENT] Criando compromisso duplo (tokens + tráfego):", body)

    const { email, nome, telefone, planId, affiliateCode, utmSource, utmCampaign } = body

    // Validações
    if (!email || !nome || !telefone || !planId) {
      return NextResponse.json({ error: "Dados obrigatórios faltando" }, { status: 400 })
    }

    // Verificar se o plano existe
    const plan = INVESTMENT_PLANS.find((p) => p.id === planId)
    if (!plan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 })
    }

    // Calcular detalhes do compromisso
    const commitmentDetails = calculateMonthlyCommitment(planId)
    const investmentBonus = calculateInvestmentBonus(planId, plan.monthlyValue, !!affiliateCode)

    // Buscar ou criar usuário
    let { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (userError && userError.code === "PGRST116") {
      // Usuário não existe, criar
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          name: nome,
          email: email.toLowerCase(),
          phone: telefone,
          role: "buyer",
          status: "active",
        })
        .select("id")
        .single()

      if (createError) {
        console.error("❌ [DUAL-COMMITMENT] Erro ao criar usuário:", createError)
        return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
      }
      user = newUser
    }

    // Buscar afiliado se código fornecido
    let affiliateId = null
    let targetUrl = "https://agdtoken.com/ofertas"
    
    if (affiliateCode) {
      const { data: affiliate } = await supabaseAdmin
        .from("affiliates")
        .select("id, affiliate_code")
        .eq("affiliate_code", affiliateCode.toUpperCase())
        .eq("status", "active")
        .single()

      if (affiliate) {
        affiliateId = affiliate.id
        targetUrl = `https://agdtoken.com/ofertas?ref=${affiliate.affiliate_code}`
        console.log("✅ [DUAL-COMMITMENT] Afiliado encontrado:", affiliateCode)
      }
    }

    // Criar compromisso mensal duplo (tokens + tráfego)
    const nextPaymentDate = new Date()
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30) // Próximo pagamento em 30 dias

    const { data: commitment, error: commitmentError } = await supabaseAdmin
      .from("monthly_commitments")
      .insert({
        user_id: user.id,
        plan_id: planId,
        monthly_amount: plan.monthlyValue,
        total_months: plan.minCommitmentMonths,
        remaining_months: plan.minCommitmentMonths,
        start_date: new Date().toISOString(),
        next_payment_date: nextPaymentDate.toISOString(),
        status: "active",
        traffic_budget: commitmentDetails.monthlyTrafficBudget,
        tokens_generated: 0, // Será incrementado a cada pagamento
        affiliate_id: affiliateId,
        utm_source: utmSource,
        utm_campaign: utmCampaign,
      })
      .select("id")
      .single()

    if (commitmentError) {
      console.error("❌ [DUAL-COMMITMENT] Erro ao criar compromisso:", commitmentError)
      return NextResponse.json({ error: "Erro ao criar compromisso" }, { status: 500 })
    }

    // Criar primeiro investimento (mês 1) - com tokens e bônus
    const unlockDate = new Date()
    unlockDate.setDate(unlockDate.getDate() + plan.lockPeriod)

    const { data: investment, error: investmentError } = await supabaseAdmin
      .from("investments")
      .insert({
        user_id: user.id,
        plan_id: planId,
        commitment_id: commitment.id,
        amount: plan.monthlyValue,
        bonus: investmentBonus.bonus,
        affiliate_bonus: investmentBonus.affiliateBonus,
        affiliate_id: affiliateId,
        status: "pending",
        payment_method: "pix",
        is_monthly_payment: true,
        month_number: 1,
        unlock_date: unlockDate.toISOString(),
      })
      .select("id")
      .single()

    if (investmentError) {
      console.error("❌ [DUAL-COMMITMENT] Erro ao criar investimento:", investmentError)
      return NextResponse.json({ error: "Erro ao criar investimento" }, { status: 500 })
    }

    // Criar campanha de tráfego
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("traffic_campaigns")
      .insert({
        user_id: user.id,
        commitment_id: commitment.id,
        monthly_budget: commitmentDetails.monthlyTrafficBudget,
        target_url: targetUrl,
        status: "active",
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spent: 0,
      })
      .select("id")
      .single()

    if (campaignError) {
      console.error("❌ [DUAL-COMMITMENT] Erro ao criar campanha:", campaignError)
      return NextResponse.json({ error: "Erro ao criar campanha de tráfego" }, { status: 500 })
    }

    // Se há afiliado, registrar a comissão potencial
    if (affiliateId) {
      const commissionAmount = (plan.monthlyValue * plan.affiliateBonusPercent) / 100
      
      await supabaseAdmin
        .from("affiliate_commissions")
        .insert({
          affiliate_id: affiliateId,
          investment_id: investment.id,
          amount: commissionAmount,
          percentage: plan.affiliateBonusPercent,
          status: "pending",
          generated_at: new Date().toISOString(),
        })
    }

    console.log("✅ [DUAL-COMMITMENT] Compromisso duplo criado com sucesso:", {
      commitmentId: commitment.id,
      investmentId: investment.id,
      campaignId: campaign.id,
      monthlyTokens: investmentBonus.tokens,
      monthlyTrafficBudget: commitmentDetails.monthlyTrafficBudget,
      targetUrl,
    })

    return NextResponse.json({
      success: true,
      commitmentId: commitment.id,
      investmentId: investment.id,
      campaignId: campaign.id,
      monthlyAmount: plan.monthlyValue,
      totalAmount: commitmentDetails.totalValue,
      monthlyTokens: investmentBonus.tokens,
      totalTokens: commitmentDetails.totalTokens,
      monthlyTrafficBudget: commitmentDetails.monthlyTrafficBudget,
      totalTrafficBudget: commitmentDetails.totalTrafficBudget,
      targetUrl,
      nextPaymentDate: nextPaymentDate.toISOString(),
      message: "Compromisso duplo (tokens + tráfego) criado com sucesso!",
    })
  } catch (error) {
    console.error("💥 [DUAL-COMMITMENT] Erro na API:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
