import { supabase } from "./supabase-browser"

export interface AffiliateStats {
  totalSales: number
  totalCommission: number
  pendingCommission: number
  totalClicks: number
  conversionRate: number
  currentMonthSales: number
  currentMonthCommission: number
}

export interface AffiliateSale {
  id: string
  date: string
  customerName: string
  saleValue: number
  commission: number
  status: "paid" | "pending" | "cancelled"
  product: string
}

export interface AffiliatePayment {
  id: string
  date: string
  amount: number
  method: string
  status: "paid" | "pending" | "processing"
  reference: string
}

export async function getAffiliateStats(affiliateId: string): Promise<AffiliateStats> {
  try {
    console.log("📊 [DASHBOARD] Buscando estatísticas do afiliado:", affiliateId)

    // Buscar dados básicos do afiliado
    const { data: affiliate, error: affiliateError } = await supabase
      .from("affiliates")
      .select("total_sales, total_commission, total_clicks")
      .eq("id", affiliateId)
      .single()

    if (affiliateError) {
      console.error("❌ [DASHBOARD] Erro ao buscar afiliado:", affiliateError)
      throw affiliateError
    }

    // Buscar vendas do mês atual
    const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
    const { data: monthlySales, error: monthlyError } = await supabase
      .from("sales")
      .select("sale_value, commission")
      .eq("affiliate_id", affiliateId)
      .gte("created_at", `${currentMonth}-01`)
      .lt("created_at", `${currentMonth}-32`)

    if (monthlyError) {
      console.error("❌ [DASHBOARD] Erro ao buscar vendas mensais:", monthlyError)
    }

    // Buscar comissões pendentes
    const { data: pendingSales, error: pendingError } = await supabase
      .from("sales")
      .select("commission")
      .eq("affiliate_id", affiliateId)
      .eq("status", "pending")

    if (pendingError) {
      console.error("❌ [DASHBOARD] Erro ao buscar comissões pendentes:", pendingError)
    }

    // Calcular estatísticas
    const currentMonthSales = monthlySales?.length || 0
    const currentMonthCommission = monthlySales?.reduce((sum, sale) => sum + (sale.commission || 0), 0) || 0
    const pendingCommission = pendingSales?.reduce((sum, sale) => sum + (sale.commission || 0), 0) || 0
    const conversionRate = affiliate.total_clicks > 0 ? (affiliate.total_sales / affiliate.total_clicks) * 100 : 0

    const stats: AffiliateStats = {
      totalSales: affiliate.total_sales || 0,
      totalCommission: affiliate.total_commission || 0,
      pendingCommission,
      totalClicks: affiliate.total_clicks || 0,
      conversionRate,
      currentMonthSales,
      currentMonthCommission,
    }

    console.log("✅ [DASHBOARD] Estatísticas carregadas:", stats)
    return stats
  } catch (error) {
    console.error("💥 [DASHBOARD] Erro ao buscar estatísticas:", error)

    // Retornar dados padrão em caso de erro
    return {
      totalSales: 0,
      totalCommission: 0,
      pendingCommission: 0,
      totalClicks: 0,
      conversionRate: 0,
      currentMonthSales: 0,
      currentMonthCommission: 0,
    }
  }
}

export async function getAffiliateSales(affiliateId: string, limit = 10): Promise<AffiliateSale[]> {
  try {
    console.log("💰 [DASHBOARD] Buscando vendas do afiliado:", affiliateId)

    const { data: sales, error } = await supabase
      .from("sales")
      .select(`
        id,
        created_at,
        customer_name,
        sale_value,
        commission,
        status,
        product_name
      `)
      .eq("affiliate_id", affiliateId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("❌ [DASHBOARD] Erro ao buscar vendas:", error)
      return []
    }

    const formattedSales: AffiliateSale[] =
      sales?.map((sale) => ({
        id: sale.id,
        date: new Date(sale.created_at).toLocaleDateString("pt-BR"),
        customerName: sale.customer_name || "Cliente",
        saleValue: sale.sale_value || 0,
        commission: sale.commission || 0,
        status: sale.status || "pending",
        product: sale.product_name || "AGD Token",
      })) || []

    console.log("✅ [DASHBOARD] Vendas carregadas:", formattedSales.length)
    return formattedSales
  } catch (error) {
    console.error("💥 [DASHBOARD] Erro ao buscar vendas:", error)
    return []
  }
}

export async function getAffiliatePayments(affiliateId: string, limit = 10): Promise<AffiliatePayment[]> {
  try {
    console.log("💳 [DASHBOARD] Buscando pagamentos do afiliado:", affiliateId)

    const { data: payments, error } = await supabase
      .from("affiliate_payments")
      .select(`
        id,
        created_at,
        amount,
        payment_method,
        status,
        reference
      `)
      .eq("affiliate_id", affiliateId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("❌ [DASHBOARD] Erro ao buscar pagamentos:", error)
      return []
    }

    const formattedPayments: AffiliatePayment[] =
      payments?.map((payment) => ({
        id: payment.id,
        date: new Date(payment.created_at).toLocaleDateString("pt-BR"),
        amount: payment.amount || 0,
        method: payment.payment_method || "PIX",
        status: payment.status || "pending",
        reference: payment.reference || payment.id,
      })) || []

    console.log("✅ [DASHBOARD] Pagamentos carregados:", formattedPayments.length)
    return formattedPayments
  } catch (error) {
    console.error("💥 [DASHBOARD] Erro ao buscar pagamentos:", error)
    return []
  }
}

export async function getAffiliateProfile(userId: string) {
  try {
    console.log("👤 [DASHBOARD] Buscando perfil do afiliado:", userId)

    const { data: profile, error } = await supabase
      .from("affiliates")
      .select(`
        id,
        affiliate_code,
        phone,
        cpf,
        tier,
        status,
        total_sales,
        total_commission,
        commission_rate,
        created_at,
        users (
          name,
          email
        )
      `)
      .eq("user_id", userId)
      .single()

    if (error) {
      console.error("❌ [DASHBOARD] Erro ao buscar perfil:", error)
      return null
    }

    console.log("✅ [DASHBOARD] Perfil carregado:", profile.affiliate_code)
    return profile
  } catch (error) {
    console.error("💥 [DASHBOARD] Erro ao buscar perfil:", error)
    return null
  }
}
