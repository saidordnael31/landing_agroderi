import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { generateAffiliateCode } from "@/lib/affiliate-utils"

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

    // Verificar email existente
    const { data: existingUser } = await supabaseAdmin
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
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(senha, 12)

    // Gerar código do afiliado
    const affiliateCode = generateAffiliateCode(nome)

    // Criar usuário
    const { data: newUser, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        name: nome,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: "affiliate",
        status: "active",
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (userError || !newUser) {
      console.error("❌ [REGISTER] Erro ao criar usuário:", userError)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar usuário",
          code: "USER_ERROR",
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
        user_id: newUser.id,
        affiliate_code: affiliateCode,
        phone: telefone,
        cpf: cpf || null,
        experience: experiencia || null,
        channels: canais || [],
        motivation: motivacao || null,
        tier: "bronze",
        status: "active",
        total_sales: 0,
        total_commission: 0,
        created_at: new Date().toISOString(),
      })
      .select("id, affiliate_code")
      .single()

    if (affiliateError || !newAffiliate) {
      console.error("❌ [REGISTER] Erro ao criar afiliado:", affiliateError)

      // Rollback - deletar usuário
      await supabaseAdmin.from("users").delete().eq("id", newUser.id)

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
            id: newUser.id,
            name: nome,
            email: email.toLowerCase(),
            role: "affiliate",
          },
          affiliate: {
            id: newAffiliate.id,
            affiliate_code: newAffiliate.affiliate_code,
            tier: "bronze",
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
