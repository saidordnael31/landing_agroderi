import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const body = await request.json()
  console.log("API Recebeu ➜", body)

  const { name, email, profile, language, earnedTokens } = body

  if (!name || !email) {
    return NextResponse.json({ error: "Nome e email são obrigatórios." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("leads")
    .insert([
      {
        name,
        email,
        profile,
        language,
        earned_tokens: earnedTokens,
      },
    ])
    .select()

  if (error) {
    console.error("Erro no Supabase:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log("Salvo no Supabase com sucesso:", data)
  return NextResponse.json({ success: true, data })
}
