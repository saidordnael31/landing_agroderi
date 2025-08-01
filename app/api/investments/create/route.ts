import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📥 [INVESTMENT] Dados do investimento:", body)

    const { email, nome, telefone, planId, amount, affiliateCode, utmSource, utmCampaign, utmMedium } = body

    // Validações
    if (!email || !nome || !telefone || !planId || !amount) {
      return NextResponse.json({ error: "Dados obrigatórios faltando" }, { status: 400 })
    }

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
        console.error("❌ [INVESTMENT] Erro ao criar usuário:", createError)
        return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
      }
      user = newUser
    }

    // Buscar afiliado se código fornecido
    let affiliateId = null
    let affiliateData = null

    if (affiliateCode) {
      console.log("🔍 [INVESTMENT] Buscando afiliado:", affiliateCode)

      const { data: affiliate, error: affiliateError } = await supabaseAdmin
        .from("affiliates")
        .select("id, affiliate_code, current_tier, commission_rate_direct")
        .eq("affiliate_code", affiliateCode.toUpperCase())
        .eq("status", "active")
        .single()

      if (affiliate && !affiliateError) {
        affiliateId = affiliate.id
        affiliateData = affiliate
        console.log("✅ [INVESTMENT] Afiliado encontrado:", affiliate.affiliate_code)
      } else {
        console.warn("⚠️ [INVESTMENT] Afiliado não encontrado:", affiliateCode)
      }
    }

    // Calcular bônus baseado no plano
    let bonus = 0
    let affiliateBonus = 0

    switch (planId) {
      case "plano-basico":
        bonus = amount * 0.1 // 10%
        affiliateBonus = amount * 0.05 // 5%
        break
      case "plano-premium":
        bonus = amount * 0.2 // 20%
        affiliateBonus = amount * 0.1 // 10%
        break
      case "plano-vip":
        bonus = amount * 0.3 // 30%
        affiliateBonus = amount * 0.15 // 15%
        break
    }

    // Criar investimento
    const { data: investment, error: investmentError } = await supabaseAdmin
      .from("investments")
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount: amount,
        bonus: bonus,
        affiliate_bonus: affiliateBonus,
        affiliate_id: affiliateId,
        status: "pending", // Será confirmado após pagamento
        payment_method: "pix",
        utm_source: utmSource,
        utm_campaign: utmCampaign,
        unlock_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      })
      .select("id, amount, bonus")
      .single()

    if (investmentError) {
      console.error("❌ [INVESTMENT] Erro ao criar investimento:", investmentError)
      return NextResponse.json({ error: "Erro ao criar investimento" }, { status: 500 })
    }

    console.log("✅ [INVESTMENT] Investimento criado:", investment.id)

    // Se tem afiliado, processar comissões automaticamente
    // Em produção, isso seria feito via webhook do gateway de pagamento
    if (affiliateId && affiliateData) {
      console.log("💰 [INVESTMENT] Processando comissões...")

      // Simular confirmação de pagamento após 2 segundos
      setTimeout(async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/sales/process`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                investmentId: investment.id,
                affiliateCode: affiliateData.affiliate_code,
                saleAmount: amount,
                customerId: user.id,
                utmSource,
                utmMedium,
                utmCampaign,
              }),
            },
          )

          const result = await response.json()
          console.log("🎉 [INVESTMENT] Comissões processadas:", result)
        } catch (error) {
          console.error("❌ [INVESTMENT] Erro ao processar comissões:", error)
        }
      }, 2000)
    }

    return NextResponse.json({
      success: true,
      investmentId: investment.id,
      amount: investment.amount,
      bonus: investment.bonus,
      affiliateCode: affiliateData?.affiliate_code,
      commissionRate: affiliateData?.commission_rate_direct,
      message: "Investimento criado com sucesso!",
    })
  } catch (error) {
    console.error("💥 [INVESTMENT] Erro na API:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
