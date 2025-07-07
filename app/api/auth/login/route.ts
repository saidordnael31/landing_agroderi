import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Buscar usuário no banco
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("status", "active")
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Para demo, aceitar senhas simples baseadas no role
    const validPasswords: Record<string, string[]> = {
      admin: ["admin123", "123456"],
      viewer: ["viewer123", "123456"],
      affiliate: ["afiliado123", "123456"],
      buyer: ["cliente123", "123456"],
    }

    const userPasswords = validPasswords[user.role] || ["123456"]
    if (!userPasswords.includes(password)) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Gerar JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || "agroderi-secret-key-2024",
      { expiresIn: "7d" },
    )

    // Atualizar último login
    await supabase.from("users").update({ updated_at: new Date().toISOString() }).eq("id", user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
