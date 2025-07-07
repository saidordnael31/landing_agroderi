import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    if (!["admin", "viewer"].includes(decoded.role)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Buscar estatísticas
    const [{ count: totalUsers }, { count: totalInvestments }, { data: investments }, { data: commissions }] =
      await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("investments").select("*", { count: "exact", head: true }),
        supabase
          .from("investments")
          .select(`
        *,
        users(name, email),
        affiliates(affiliate_code)
      `)
          .order("created_at", { ascending: false }),
        supabase
          .from("commissions")
          .select(`
        *,
        affiliates(affiliate_code, users(name))
      `)
          .order("created_at", { ascending: false }),
      ])

    // Calcular totais
    const totalVolume = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0
    const totalCommissions = commissions?.reduce((sum, comm) => sum + Number(comm.amount), 0) || 0
    const pendingWithdrawals = investments?.filter((inv) => inv.withdrawal_requested).length || 0

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalInvestments: totalInvestments || 0,
        totalVolume,
        totalCommissions,
        pendingWithdrawals,
        activeAffiliates: commissions?.length || 0,
      },
      investments: investments || [],
      commissions: commissions || [],
    })
  } catch (error) {
    console.error("Erro no dashboard admin:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
