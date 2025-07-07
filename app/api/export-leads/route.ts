import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar todos os leads
    const { data: leads, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Criar CSV
    const csvHeaders = ["Nome", "Email", "Perfil", "Idioma", "Tokens Ganhos", "Data de Inscrição"]
    const csvRows =
      leads?.map((lead) => [
        lead.name || "",
        lead.email || "",
        lead.profile || "",
        lead.language || "",
        lead.earned_tokens || 0,
        lead.created_at ? new Date(lead.created_at).toLocaleString("pt-BR") : "",
      ]) || []

    const csvContent = [csvHeaders.join(","), ...csvRows.map((row) => row.map((field) => `"${field}"`).join(","))].join(
      "\n",
    )

    // Retornar CSV como download
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads-agroderi-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Erro ao exportar dados" }, { status: 500 })
  }
}
