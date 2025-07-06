import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DashboardIndexPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se o usuário não estiver autenticado, redireciona para o login
  if (!session) {
    redirect("/login")
  }

  // Usuário autenticado → envia para a seção padrão (Vídeos)
  redirect("/dashboard/videos")
}
