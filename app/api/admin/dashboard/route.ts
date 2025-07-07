import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "agroderi-secret-key-2024") as any
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    if (!["admin", "viewer"].includes(decoded.role)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Buscar estatísticas gerais
    const [{ count: totalUsers }, { count: totalInvestments }, { count: totalAffiliates }, { count: totalMissions }] =
      await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("investments").select("*", { count: "exact", head: true }),
        supabase.from("affiliates").select("*", { count: "exact", head: true }),
        supabase.from("missions").select("*", { count: "exact", head: true }),
      ])

    // Buscar investimentos com detalhes
    const { data: investments } = await supabase
      .from("investments")
      .select(`
        *,
        users(name, email),
        affiliates(affiliate_code, users(name))
      `)
      .order("created_at", { ascending: false })
      .limit(50)

    // Buscar comissões com detalhes
    const { data: commissions } = await supabase
      .from("commissions")
      .select(`
        *,
        affiliates(affiliate_code, users(name)),
        investments(amount, plan_id)
      `)
      .order("created_at", { ascending: false })
      .limit(50)

    // Buscar missões recentes
    const { data: missions } = await supabase
      .from("missions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    // Calcular totais
    const totalVolume = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0
    const totalCommissions = commissions?.reduce((sum, comm) => sum + Number(comm.amount), 0) || 0
    const pendingWithdrawals = investments?.filter((inv) => inv.withdrawal_requested).length || 0
    const completedMissions = missions?.filter((mission) => mission.status === "completed").length || 0

    // Estatísticas por período (últimos 30 dias)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentInvestments = investments?.filter((inv) => new Date(inv.created_at) >= thirtyDaysAgo) || []

    const monthlyVolume = recentInvestments.reduce((sum, inv) => sum + Number(inv.amount), 0)
    const monthlyInvestments = recentInvestments.length

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalInvestments: totalInvestments || 0,
        totalAffiliates: totalAffiliates || 0,
        totalMissions: totalMissions || 0,
        totalVolume,
        totalCommissions,
        pendingWithdrawals,
        completedMissions,
        monthlyVolume,
        monthlyInvestments,
      },
      data: {
        investments: investments || [],
        commissions: commissions || [],
        missions: missions || [],
      },
    })
  } catch (error) {
    console.error("Erro no dashboard admin:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
