import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { generateAffiliateCode } from "@/lib/affiliate-utils"
import { INVESTMENT_PLANS, calculateMonthlyCommitment, getCommissionRate } from "@/lib/business-rules"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  console.log("🚀 [USER REGISTER] Iniciando cadastro...")

  try {
    const body = await request.json()
    const {
      nome,
      email,
      telefone,
      cpf,
      senha,
      experiencia,
      canais,
      motivacao,
      selectedPlan,
      affiliateCode,
      registrationType = "commitment",
    } = body

    console.log("📧 [USER REGISTER] Email:", email, "Plano:", selectedPlan)

    // Validações
    if (!nome || !email || !telefone || !senha || !selectedPlan) {
      return NextResponse.json(
        {
          success: false,
          error: "Campos obrigatórios não preenchidos",
          code: "MISSING_FIELDS",
        },
        { status: 400 },
      )
    }

    // Verificar se usuário já existe
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Email já cadastrado",
          code: "EMAIL_EXISTS",
        },
        { status: 409 },
      )
    }

    // Buscar dados do plano
    const plan = INVESTMENT_PLANS.find((p) => p.id === selectedPlan)
    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          error: "Plano não encontrado",
          code: "INVALID_PLAN",
        },
        { status: 400 },
      )
    }

    const planDetails = calculateMonthlyCommitment(selectedPlan)
    if (!planDetails) {
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao calcular detalhes do plano",
          code: "PLAN_CALCULATION_ERROR",
        },
        { status: 500 },
      )
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(senha, 12)

    // Gerar código do afiliado
    const newAffiliateCode = generateAffiliateCode(nome)

    // Buscar afiliado que indicou (se houver)
    let referrerAffiliate = null
    if (affiliateCode) {
      const { data } = await supabaseAdmin
        .from("affiliates")
        .select("id, user_id")
        .eq("affiliate_code", affiliateCode.toUpperCase())
        .single()

      referrerAffiliate = data
    }

    // Criar usuário
    const { data: newUser, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        name: nome,
        email: email.toLowerCase(),
        phone: telefone,
        cpf: cpf || null,
        password_hash: passwordHash,
        role: "affiliate",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, name, email, role")
      .single()

    if (userError || !newUser) {
      console.error("❌ [USER REGISTER] Erro ao criar usuário:", userError)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar usuário",
          code: "USER_CREATION_ERROR",
        },
        { status: 500 },
      )
    }

    // Determinar tier baseado no plano - mapear para valores válidos do banco
    let tier: "standard" | "premium" = "standard" // Default para standard

    // Mapear planos para tiers válidos
    if (selectedPlan === "premium" || selectedPlan === "enterprise" || selectedPlan === "growth") {
      tier = "premium"
    } else {
      tier = "standard" // starter, basic, etc.
    }

    const commissionRate = getCommissionRate(tier)

    // Criar afiliado com dados do compromisso
    const { data: newAffiliate, error: affiliateError } = await supabaseAdmin
      .from("affiliates")
      .insert({
        user_id: newUser.id,
        affiliate_code: newAffiliateCode,
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
        // Novos campos para o compromisso
        selected_plan: selectedPlan,
        monthly_commitment: plan.monthlyValue,
        commitment_months: plan.minCommitmentMonths,
        monthly_tokens: planDetails.monthlyTokens,
        traffic_budget: planDetails.monthlyTrafficBudget,
        target_url: null, // Definir target_url como null
        registration_type: registrationType,
        marketing_experience: experiencia || null,
        commitment_status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, affiliate_code, selected_plan, monthly_commitment")
      .single()

    if (affiliateError || !newAffiliate) {
      console.error("❌ [USER REGISTER] Erro ao criar afiliado:", affiliateError)

      // Limpar usuário criado em caso de erro
      await supabaseAdmin.from("users").delete().eq("id", newUser.id)

      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar afiliado",
          code: "AFFILIATE_CREATION_ERROR",
        },
        { status: 500 },
      )
    }

    // Log do evento
    await supabaseAdmin.from("event_logs").insert({
      user_id: newUser.id,
      event_name: "user_registered",
      event_data: {
        registration_type: registrationType,
        selected_plan: selectedPlan,
        monthly_commitment: plan.monthlyValue,
        referrer_code: affiliateCode || null,
        referrer_id: referrerAffiliate?.id || null,
      },
      created_at: new Date().toISOString(),
    })

    console.log("✅ [USER REGISTER] Sucesso:", newAffiliate.affiliate_code)

    return NextResponse.json(
      {
        success: true,
        message: "Cadastro realizado com sucesso!",
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
          affiliate: {
            id: newAffiliate.id,
            affiliate_code: newAffiliate.affiliate_code,
            selected_plan: newAffiliate.selected_plan,
            monthly_commitment: newAffiliate.monthly_commitment,
            tier: tier,
            commission_rate: commissionRate,
            status: "active",
          },
          plan: {
            id: selectedPlan,
            name: plan.name,
            monthlyValue: plan.monthlyValue,
            totalValue: planDetails.totalValue,
            monthlyTokens: planDetails.monthlyTokens,
            totalTokens: planDetails.totalTokens,
          },
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("💥 [USER REGISTER] Erro:", error)

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

export async function GET() {
  return NextResponse.json({ message: "API de cadastro de usuários funcionando" }, { status: 200 })
}
