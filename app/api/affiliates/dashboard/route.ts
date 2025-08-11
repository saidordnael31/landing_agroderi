import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Aqui você implementaria a autenticação JWT
    // Por simplicidade, vamos usar um header de autorização básico
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: "Token de autorização necessário",
          code: "MISSING_AUTH",
        },
        { status: 401 },
      )
    }

    // Para este exemplo, vamos retornar dados mock
    // Em produção, você buscaria os dados reais do banco
    const mockData = {
      affiliate: {
        id: "1",
        affiliate_code: "AGD123",
        tier: "bronze",
        status: "active",
        total_sales: 5000,
        total_commission: 250,
        commission_rate: 0.05,
        total_clicks: 150,
      },
      stats: {
        total_referrals: 3,
        pending_commission: 100,
        paid_commission: 150,
        conversion_rate: 2.0,
        this_month_sales: 1500,
        this_month_commission: 75,
      },
      recent_sales: [
        {
          id: "sale1",
          amount: 1000,
          commission: 50,
          status: "paid",
          created_at: new Date().toISOString(),
          customer_name: "João Silva",
        },
        {
          id: "sale2",
          amount: 2000,
          commission: 100,
          status: "pending",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          customer_name: "Maria Santos",
        },
      ],
      links: [
        {
          id: "link1",
          url: `${process.env.NEXT_PUBLIC_API_URL}/ofertas?ref=AGD123`,
          clicks: 150,
          conversions: 3,
          created_at: new Date().toISOString(),
        },
      ],
    }

    return NextResponse.json(
      {
        success: true,
        data: mockData,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Erro no dashboard:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    )
  }
}
