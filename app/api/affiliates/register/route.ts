import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { generateAffiliateCode } from "@/lib/affiliate-utils"
import { canBecomeAffiliate, getTierByInvestment, getCommissionRate } from "@/lib/business-rules"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  console.log("🚀 [REGISTER] Iniciando cadastro...")

  try {
    // Parse do body
    const body = await request.json()
    const { nome, email, telefone, cpf, experiencia, canais, motivacao, senha } = body

    console.log("📧 [REGISTER] Email:", email)

    // Validações
    if (!nome || !email || !telefone || !senha) {
      return NextResponse.json(
        {
          success: false,
          error: "Campos obrigatórios não preenchidos",
          code: "MISSING_FIELDS",
        },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Verificar se usuário existe
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (userCheckError && userCheckError.code !== "PGRST116") {
      console.error("❌ [REGISTER] Erro ao verificar usuário:", userCheckError)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao verificar usuário",
          code: "USER_CHECK_ERROR",
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Usuário não encontrado. Você precisa fazer um investimento primeiro.",
          code: "USER_NOT_FOUND",
        },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Verificar se já é afiliado
    const { data: existingAffiliate } = await supabaseAdmin
      .from("affiliates")
      .select("id")
      .eq("user_id", existingUser.id)
      .single()

    if (existingAffiliate) {
      return NextResponse.json(
        {
          success: false,
          error: "Usuário já é afiliado",
          code: "ALREADY_AFFILIATE",
        },
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Verificar investimentos para elegibilidade
    const { data: investments, error: investmentError } = await supabaseAdmin
      .from("investments")
      .select("id, amount, status, plan_id")
      .eq("user_id", existingUser.id)

    if (investmentError) {
      console.error("❌ [REGISTER] Erro ao verificar investimentos:", investmentError)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao verificar investimentos",
          code: "INVESTMENT_ERROR",
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Verificar elegibilidade
    if (!canBecomeAffiliate(investments || [])) {
      return NextResponse.json(
        {
          success: false,
          error: "Você precisa ter pelo menos um investimento confirmado para se tornar afiliado",
          code: "NOT_ELIGIBLE",
        },
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Calcular tier baseado no maior investimento
    const maxInvestment = Math.max(...(investments?.map((inv) => inv.amount) || [0]))
    const tier = getTierByInvestment(maxInvestment)
    const commissionRate = getCommissionRate(tier)

    // Hash da senha
    const passwordHash = await bcrypt.hash(senha, 12)

    // Gerar código do afiliado
    const affiliateCode = generateAffiliateCode(nome)

    // Atualizar usuário com senha e role
    const { error: updateUserError } = await supabaseAdmin
      .from("users")
      .update({
        name: nome,
        password_hash: passwordHash,
        role: "affiliate",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingUser.id)

    if (updateUserError) {
      console.error("❌ [REGISTER] Erro ao atualizar usuário:", updateUserError)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao atualizar usuário",
          code: "USER_UPDATE_ERROR",
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Criar afiliado
    const { data: newAffiliate, error: affiliateError } = await supabaseAdmin
      .from("affiliates")
      .insert({
        user_id: existingUser.id,
        affiliate_code: affiliateCode,
        phone: telefone,
        cpf: cpf || null,
        experience: experiencia || null,
        channels: canais || [],
        motivation: motivacao || null,
        tier: tier,
        status: "active",
        total_sales: 0,
        total_commission: 0,
        commission_rate: commissionRate,
        created_at: new Date().toISOString(),
      })
      .select("id, affiliate_code")
      .single()

    if (affiliateError || !newAffiliate) {
      console.error("❌ [REGISTER] Erro ao criar afiliado:", affiliateError)

      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar afiliado",
          code: "AFFILIATE_ERROR",
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("✅ [REGISTER] Sucesso:", newAffiliate.affiliate_code)

    return NextResponse.json(
      {
        success: true,
        message: "Cadastro realizado com sucesso!",
        data: {
          user: {
            id: existingUser.id,
            name: nome,
            email: email.toLowerCase(),
            role: "affiliate",
          },
          affiliate: {
            id: newAffiliate.id,
            affiliate_code: newAffiliate.affiliate_code,
            tier: tier,
            commission_rate: commissionRate,
            status: "active",
          },
        },
      },
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("💥 [REGISTER] Erro:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        code: "INTERNAL_ERROR",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "API de cadastro funcionando" },
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  )
}
