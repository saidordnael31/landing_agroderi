import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Validar dados obrigatórios
    if (!formData.email || !formData.nome || !formData.telefone) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", formData.email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    // Criar usuário
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email: formData.email.toLowerCase(),
        name: formData.nome,
        phone: formData.telefone,
        cpf: formData.cpf,
        role: "affiliate",
        status: "pending",
      })
      .select()
      .single()

    if (userError) {
      console.error("Erro ao criar usuário:", userError)
      return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 400 })
    }

    // Gerar código único do afiliado
    const { data: codeResult, error: codeError } = await supabase.rpc("generate_affiliate_code")

    if (codeError) {
      console.error("Erro ao gerar código:", codeError)
      return NextResponse.json({ error: "Erro ao gerar código de afiliado" }, { status: 400 })
    }

    const affiliateCode = codeResult

    // Criar afiliado
    const { data: affiliate, error: affiliateError } = await supabase
      .from("affiliates")
      .insert({
        user_id: user.id,
        affiliate_code: affiliateCode,
        tier: "standard",
        status: "pending",
      })
      .select()
      .single()

    if (affiliateError) {
      console.error("Erro ao criar afiliado:", affiliateError)
      return NextResponse.json({ error: "Erro ao criar afiliado" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      affiliateCode,
      message: "Afiliado cadastrado com sucesso! Aguarde aprovação.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Erro no cadastro de afiliado:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
