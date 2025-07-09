import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Buscar estatísticas gerais
    const [{ count: totalUsers }, { count: totalAffiliates }, { count: totalInvestments }, { count: totalMissions }] =
      await Promise.all([
        supabaseAdmin.from("users").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("affiliates").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("investments").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("missions").select("*", { count: "exact", head: true }),
      ])

    // Buscar soma dos investimentos
    const { data: investmentSum } = await supabaseAdmin.from("investments").select("amount").eq("status", "confirmed")

    const totalInvested = investmentSum?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0

    // Buscar soma das comissões
    const { data: commissionSum } = await supabaseAdmin.from("commissions").select("amount").eq("status", "pending")

    const totalCommissions = commissionSum?.reduce((sum, comm) => sum + Number(comm.amount), 0) || 0

    // Buscar investimentos recentes
    const { data: recentInvestments } = await supabaseAdmin
      .from("investments")
      .select(`
        id,
        amount,
        plan_id,
        status,
        created_at,
        users (name, email)
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    // Buscar afiliados top
    const { data: topAffiliates } = await supabaseAdmin
      .from("affiliates")
      .select(`
        id,
        affiliate_code,
        total_sales,
        total_commission,
        users (name, email)
      `)
      .order("total_commission", { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers: totalUsers || 0,
          totalAffiliates: totalAffiliates || 0,
          totalInvestments: totalInvestments || 0,
          totalMissions: totalMissions || 0,
          totalInvested,
          totalCommissions,
        },
        recentInvestments: recentInvestments || [],
        topAffiliates: topAffiliates || [],
      },
    })
  } catch (error) {
    console.error("Erro na API do dashboard:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
