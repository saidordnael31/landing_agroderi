import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const body = await request.json()
  console.log("API Recebeu ➜", body)

  const { name, email, profile, language, earnedTokens } = body

  if (!name || !email) {
    return NextResponse.json({ error: "Nome e email são obrigatórios." }, { status: 400 })
  }

  // Salva ou atualiza o lead pelo e-mail
  const { data, error } = await supabase
    .from("leads")
    .upsert(
      {
        name,
        email,
        profile,
        language,
        earned_tokens: earnedTokens,
      },
      { onConflict: "email" }, // usa o campo único “email” como referência
    )
    .select()

  if (error) {
    console.error("Erro no Supabase:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data,
    message: "Lead inserido ou atualizado com sucesso",
  })
}
