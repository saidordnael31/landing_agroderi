import { type NextRequest, NextResponse } from "next/server"
import { supabase, createUser, createInvestment, getAffiliateByCode, logEvent } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      phone,
      cpf,
      planId,
      amount,
      affiliateCode,
      utmSource,
      paymentMethod = "pix",
    } = await request.json()

    // Validações básicas
    if (!name || !email || !phone || !planId || !amount) {
      return NextResponse.json({ error: "Dados obrigatórios: nome, email, telefone, plano e valor" }, { status: 400 })
    }

    if (amount < 100) {
      return NextResponse.json({ error: "Valor mínimo de investimento é R$ 100" }, { status: 400 })
    }

    // Buscar ou criar usuário
    const user = await supabase.from("users").select("*").eq("email", email.toLowerCase()).single()

    if (user.error) {
      // Criar novo usuário
      const newUser = await createUser({
        name,
        email: email.toLowerCase(),
        phone,
        cpf,
        role: "buyer",
        status: "active",
      })

      if (!newUser) {
        return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
      }
      user.data = newUser
    }

    // Buscar afiliado se código fornecido
    let affiliate = null
    if (affiliateCode) {
      affiliate = await getAffiliateByCode(affiliateCode)
      if (!affiliate) {
        return NextResponse.json({ error: "Código de afiliado inválido" }, { status: 400 })
      }
    }

    // Calcular bônus baseado no plano
    let bonus = 0
    let affiliateBonus = 0

    switch (planId) {
      case "starter":
        bonus = amount * 0.05 // 5%
        affiliateBonus = affiliate ? amount * 0.03 : 0 // 3%
        break
      case "premium":
        bonus = amount * 0.1 // 10%
        affiliateBonus = affiliate ? amount * 0.05 : 0 // 5%
        break
      case "vip":
        bonus = amount * 0.15 // 15%
        affiliateBonus = affiliate ? amount * 0.08 : 0 // 8%
        break
      default:
        bonus = amount * 0.03 // 3%
        affiliateBonus = affiliate ? amount * 0.02 : 0 // 2%
    }

    // Data de desbloqueio (30 dias)
    const unlockDate = new Date()
    unlockDate.setDate(unlockDate.getDate() + 30)

    // Criar investimento
    const investment = await createInvestment({
      user_id: user.data.id,
      plan_id: planId,
      amount,
      bonus,
      affiliate_bonus: affiliateBonus,
      affiliate_id: affiliate?.id,
      status: "pending",
      purchase_date: new Date().toISOString(),
      unlock_date: unlockDate.toISOString(),
      payment_method: paymentMethod,
      utm_source: utmSource,
      transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    })

    if (!investment) {
      return NextResponse.json({ error: "Erro ao criar investimento" }, { status: 500 })
    }

    // Log do evento
    await logEvent({
      user_id: user.data.id,
      event_name: "investment_created",
      event_data: {
        plan_id: planId,
        amount,
        affiliate_code: affiliateCode,
        utm_source: utmSource,
      },
      ip_address: request.ip,
    })

    return NextResponse.json({
      success: true,
      message: "Investimento criado com sucesso!",
      data: {
        investment: {
          id: investment.id,
          plan_id: investment.plan_id,
          amount: investment.amount,
          bonus: investment.bonus,
          affiliate_bonus: investment.affiliate_bonus,
          status: investment.status,
          unlock_date: investment.unlock_date,
          transaction_id: investment.transaction_id,
        },
        redirect_url: "https://www.agroderi.in",
      },
    })
  } catch (error) {
    console.error("Erro ao criar investimento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")

    if (!userId) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    let query = supabase
      .from("investments")
      .select(`
        *,
        users (
          id,
          name,
          email
        ),
        affiliates (
          id,
          affiliate_code,
          users (
            name
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data: investments, error } = await query

    if (error) {
      return NextResponse.json({ error: "Erro ao buscar investimentos" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: investments,
    })
  } catch (error) {
    console.error("Erro ao buscar investimentos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
