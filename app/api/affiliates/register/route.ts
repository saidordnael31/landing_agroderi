import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Gerar código único do afiliado
    const affiliateCode = `AGD${Date.now().toString().slice(-6)}`

    // Criar usuário
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email: formData.email,
        name: formData.nome,
        phone: formData.telefone,
        cpf: formData.cpf,
        role: "affiliate",
      })
      .select()
      .single()

    if (userError) {
      return NextResponse.json({ error: "Erro ao criar usuário: " + userError.message }, { status: 400 })
    }

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
      return NextResponse.json({ error: "Erro ao criar afiliado: " + affiliateError.message }, { status: 400 })
    }

    // Enviar email de boas-vindas (implementar depois)
    // await sendWelcomeEmail(user.email, affiliateCode)

    return NextResponse.json({
      success: true,
      affiliateCode,
      message: "Afiliado cadastrado com sucesso!",
    })
  } catch (error) {
    console.error("Erro no cadastro de afiliado:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
