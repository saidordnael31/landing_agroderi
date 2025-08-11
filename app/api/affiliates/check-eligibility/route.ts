import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { canBecomeAffiliate, BUSINESS_RULES } from "@/lib/business-rules"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email é obrigatório",
          code: "MISSING_EMAIL",
        },
        { status: 400 },
      )
    }

    // Buscar usuário
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, name")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          eligible: false,
          error: "Usuário não encontrado. Você precisa fazer um investimento primeiro.",
          code: "USER_NOT_FOUND",
        },
        { status: 404 },
      )
    }

    // Verificar se já é afiliado
    const { data: existingAffiliate } = await supabaseAdmin
      .from("affiliates")
      .select("id, affiliate_code, status")
      .eq("user_id", user.id)
      .single()

    if (existingAffiliate) {
      return NextResponse.json(
        {
          success: true,
          eligible: false,
          error: "Você já é um afiliado cadastrado",
          code: "ALREADY_AFFILIATE",
          data: {
            affiliate_code: existingAffiliate.affiliate_code,
            status: existingAffiliate.status,
          },
        },
        { status: 200 },
      )
    }

    // Buscar investimentos do usuário
    const { data: investments, error: investmentError } = await supabaseAdmin
      .from("investments")
      .select("id, amount, status, plan_id, purchase_date")
      .eq("user_id", user.id)

    if (investmentError) {
      console.error("Erro ao buscar investimentos:", investmentError)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao verificar investimentos",
          code: "INVESTMENT_ERROR",
        },
        { status: 500 },
      )
    }

    // Verificar elegibilidade
    const eligible = canBecomeAffiliate(investments || [])

    if (!eligible) {
      const minAmount = BUSINESS_RULES.AFFILIATE.MIN_INVESTMENT_AMOUNT

      return NextResponse.json(
        {
          success: true,
          eligible: false,
          error: `Para se tornar afiliado, você precisa ter pelo menos um investimento confirmado de R$ ${minAmount} ou mais.`,
          code: "NOT_ELIGIBLE",
          requirements: {
            min_investment: minAmount,
            eligible_status: BUSINESS_RULES.AFFILIATE.ELIGIBLE_INVESTMENT_STATUS,
            current_investments: investments?.length || 0,
          },
        },
        { status: 200 },
      )
    }

    // Calcular tier baseado no maior investimento
    const maxInvestment = Math.max(...(investments?.map((inv) => inv.amount) || [0]))
    const tier =
      maxInvestment >= 20000 ? "platinum" : maxInvestment >= 5000 ? "gold" : maxInvestment >= 1000 ? "silver" : "bronze"

    return NextResponse.json(
      {
        success: true,
        eligible: true,
        message: "Você está elegível para se tornar afiliado!",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          suggested_tier: tier,
          total_investments: investments?.length || 0,
          max_investment: maxInvestment,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Erro na verificação de elegibilidade:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    )
  }
}
