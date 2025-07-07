import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de acesso requerido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "agroderi-secret-key-2024")
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Verificar se é admin ou viewer
    if (!["admin", "viewer"].includes(decoded.role)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Buscar estatísticas gerais
    const [usersResult, affiliatesResult, investmentsResult, commissionsResult, missionsResult] = await Promise.all([
      // Total de usuários por role
      supabase
        .from("users")
        .select("role, status")
        .eq("status", "active"),

      // Estatísticas de afiliados
      supabase
        .from("affiliates")
        .select("tier, status, total_sales, total_commission"),

      // Estatísticas de investimentos
      supabase
        .from("investments")
        .select("status, amount, plan_id, created_at, affiliate_id"),

      // Comissões
      supabase
        .from("commissions")
        .select("status, amount, generated_at"),

      // Missões
      supabase
        .from("missions")
        .select("status, reward_amount, created_at"),
    ])

    // Processar dados dos usuários
    const userStats = {
      total: usersResult.data?.length || 0,
      admin: usersResult.data?.filter((u) => u.role === "admin").length || 0,
      viewer: usersResult.data?.filter((u) => u.role === "viewer").length || 0,
      affiliate: usersResult.data?.filter((u) => u.role === "affiliate").length || 0,
      buyer: usersResult.data?.filter((u) => u.role === "buyer").length || 0,
    }

    // Processar dados dos afiliados
    const affiliateStats = {
      total: affiliatesResult.data?.length || 0,
      active: affiliatesResult.data?.filter((a) => a.status === "active").length || 0,
      pending: affiliatesResult.data?.filter((a) => a.status === "pending").length || 0,
      standard: affiliatesResult.data?.filter((a) => a.tier === "standard").length || 0,
      premium: affiliatesResult.data?.filter((a) => a.tier === "premium").length || 0,
      total_sales: affiliatesResult.data?.reduce((sum, a) => sum + (a.total_sales || 0), 0) || 0,
      total_commission: affiliatesResult.data?.reduce((sum, a) => sum + (a.total_commission || 0), 0) || 0,
    }

    // Processar dados dos investimentos
    const investmentStats = {
      total: investmentsResult.data?.length || 0,
      pending: investmentsResult.data?.filter((i) => i.status === "pending").length || 0,
      confirmed: investmentsResult.data?.filter((i) => i.status === "confirmed").length || 0,
      completed: investmentsResult.data?.filter((i) => i.status === "completed").length || 0,
      cancelled: investmentsResult.data?.filter((i) => i.status === "cancelled").length || 0,
      total_amount: investmentsResult.data?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0,
      with_affiliate: investmentsResult.data?.filter((i) => i.affiliate_id).length || 0,
      plans: {
        starter: investmentsResult.data?.filter((i) => i.plan_id === "starter").length || 0,
        premium: investmentsResult.data?.filter((i) => i.plan_id === "premium").length || 0,
        vip: investmentsResult.data?.filter((i) => i.plan_id === "vip").length || 0,
      },
    }

    // Processar dados das comissões
    const commissionStats = {
      total: commissionsResult.data?.length || 0,
      pending: commissionsResult.data?.filter((c) => c.status === "pending").length || 0,
      paid: commissionsResult.data?.filter((c) => c.status === "paid").length || 0,
      cancelled: commissionsResult.data?.filter((c) => c.status === "cancelled").length || 0,
      total_amount: commissionsResult.data?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0,
      paid_amount:
        commissionsResult.data?.filter((c) => c.status === "paid").reduce((sum, c) => sum + (c.amount || 0), 0) || 0,
    }

    // Processar dados das missões
    const missionStats = {
      total: missionsResult.data?.length || 0,
      pending: missionsResult.data?.filter((m) => m.status === "pending").length || 0,
      completed: missionsResult.data?.filter((m) => m.status === "completed").length || 0,
      paid: missionsResult.data?.filter((m) => m.status === "paid").length || 0,
      total_rewards: missionsResult.data?.reduce((sum, m) => sum + (m.reward_amount || 0), 0) || 0,
    }

    // Dados para gráficos (últimos 30 dias)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentInvestments = investmentsResult.data?.filter((i) => new Date(i.created_at) >= thirtyDaysAgo) || []

    const recentMissions = missionsResult.data?.filter((m) => new Date(m.created_at) >= thirtyDaysAgo) || []

    // Agrupar por dia
    const dailyStats = {}
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      dailyStats[dateStr] = {
        investments: recentInvestments.filter((inv) => inv.created_at.startsWith(dateStr)).length,
        missions: recentMissions.filter((mis) => mis.created_at.startsWith(dateStr)).length,
        revenue: recentInvestments
          .filter((inv) => inv.created_at.startsWith(dateStr))
          .reduce((sum, inv) => sum + inv.amount, 0),
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        users: userStats,
        affiliates: affiliateStats,
        investments: investmentStats,
        commissions: commissionStats,
        missions: missionStats,
        daily_stats: dailyStats,
        summary: {
          total_revenue: investmentStats.total_amount,
          total_users: userStats.total,
          active_affiliates: affiliateStats.active,
          pending_commissions: commissionStats.total_amount - commissionStats.paid_amount,
          conversion_rate: userStats.total > 0 ? ((investmentStats.total / userStats.total) * 100).toFixed(2) : 0,
        },
      },
    })
  } catch (error) {
    console.error("Erro no dashboard admin:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
