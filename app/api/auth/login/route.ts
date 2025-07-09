import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  console.log("🔐 [LOGIN] Iniciando login...")

  try {
    // Parse do body
    const body = await request.json()
    const { email, senha } = body

    console.log("📧 [LOGIN] Email:", email)

    // Validações
    if (!email || !senha) {
      return NextResponse.json(
        {
          success: false,
          error: "Email e senha são obrigatórios",
          code: "MISSING_CREDENTIALS",
        },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Buscar usuário
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, name, email, password_hash, role, status")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Email ou senha incorretos",
          code: "INVALID_CREDENTIALS",
        },
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Verificar senha
    const passwordValid = await bcrypt.compare(senha, user.password_hash)

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Email ou senha incorretos",
          code: "INVALID_CREDENTIALS",
        },
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Buscar dados do afiliado se for afiliado
    let affiliateData = null
    if (user.role === "affiliate") {
      const { data: affiliate } = await supabaseAdmin
        .from("affiliates")
        .select("id, affiliate_code, tier, status, total_sales, total_commission")
        .eq("user_id", user.id)
        .single()

      affiliateData = affiliate
    }

    // Gerar JWT
    const jwtSecret = process.env.JWT_SECRET || "fallback-secret"
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        affiliateId: affiliateData?.id || null,
        affiliateCode: affiliateData?.affiliate_code || null,
      },
      jwtSecret,
      { expiresIn: "7d" },
    )

    console.log("✅ [LOGIN] Sucesso para:", email)

    return NextResponse.json(
      {
        success: true,
        message: "Login realizado com sucesso!",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          affiliate: affiliateData,
          token: token,
        },
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("💥 [LOGIN] Erro:", error)

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
    { message: "API de login funcionando" },
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  )
}
