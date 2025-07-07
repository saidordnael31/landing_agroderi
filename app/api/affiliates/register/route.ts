import { type NextRequest, NextResponse } from "next/server"
import { supabase, createUser, createAffiliate } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, cpf } = await request.json()

    // Validações básicas
    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Nome, email e telefone são obrigatórios" }, { status: 400 })
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email.toLowerCase()).single()

    if (existingUser) {
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 })
    }

    // Criar usuário
    const user = await createUser({
      name,
      email: email.toLowerCase(),
      phone,
      cpf,
      role: "affiliate",
      status: "active",
    })

    if (!user) {
      return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
    }

    // Criar afiliado
    const affiliate = await createAffiliate(user.id, "standard")

    if (!affiliate) {
      // Se falhou, deletar o usuário criado
      await supabase.from("users").delete().eq("id", user.id)
      return NextResponse.json({ error: "Erro ao criar afiliado" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Afiliado cadastrado com sucesso!",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        affiliate: {
          id: affiliate.id,
          code: affiliate.affiliate_code,
          tier: affiliate.tier,
          status: affiliate.status,
        },
      },
    })
  } catch (error) {
    console.error("Erro no cadastro de afiliado:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Código do afiliado é obrigatório" }, { status: 400 })
    }

    const { data: affiliate, error } = await supabase
      .from("affiliates")
      .select(`
        *,
        users (
          id,
          name,
          email,
          phone,
          status
        )
      `)
      .eq("affiliate_code", code.toUpperCase())
      .eq("status", "active")
      .single()

    if (error || !affiliate) {
      return NextResponse.json({ error: "Afiliado não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: affiliate,
    })
  } catch (error) {
    console.error("Erro ao buscar afiliado:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
