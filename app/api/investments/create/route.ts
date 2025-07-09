import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📥 Dados do investimento:", body)

    const { email, nome, telefone, planId, amount, affiliateCode, utmSource, utmCampaign } = body

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
        console.error("Erro ao criar usuário:", createError)
        return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
      }
      user = newUser
    }

    // Buscar afiliado se código fornecido
    let affiliateId = null
    if (affiliateCode) {
      const { data: affiliate } = await supabaseAdmin
        .from("affiliates")
        .select("id")
        .eq("affiliate_code", affiliateCode.toUpperCase())
        .single()

      if (affiliate) {
        affiliateId = affiliate.id
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
        status: "pending",
        payment_method: "pix",
        utm_source: utmSource,
        utm_campaign: utmCampaign,
        unlock_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      })
      .select("id, amount, bonus")
      .single()

    if (investmentError) {
      console.error("Erro ao criar investimento:", investmentError)
      return NextResponse.json({ error: "Erro ao criar investimento" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      investmentId: investment.id,
      amount: investment.amount,
      bonus: investment.bonus,
      message: "Investimento criado com sucesso!",
    })
  } catch (error) {
    console.error("Erro na API de investimentos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
