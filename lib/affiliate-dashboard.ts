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
      .select(`
        id,
        total_sales,
        total_commission,
        tier,
        commission_rate,
        affiliate_code
      `)
      .eq("id", affiliateId)
      .single()

    if (affiliateError) {
      console.error("❌ [DASHBOARD] Erro ao buscar afiliado:", affiliateError)
      throw affiliateError
    }

    console.log("✅ [DASHBOARD] Dados do afiliado:", affiliate)

    // Contar cliques reais na tabela de tracking
    const { count: clickCount, error: clicksError } = await supabase
      .from("affiliate_clicks")
      .select("*", { count: "exact", head: true })
      .eq("affiliate_id", affiliateId)

    if (clicksError) {
      console.error("❌ [DASHBOARD] Erro ao contar cliques:", clicksError)
    }

    // Buscar investimentos do afiliado
    const { data: investments, error: investmentsError } = await supabase
      .from("investments")
      .select("amount, created_at, status")
      .eq("affiliate_id", affiliateId)

    if (investmentsError) {
      console.error("❌ [DASHBOARD] Erro ao buscar investimentos:", investmentsError)
    }

    console.log("💰 [DASHBOARD] Investimentos encontrados:", investments?.length || 0)

    // Buscar comissões
    const { data: commissions, error: commissionsError } = await supabase
      .from("commissions")
      .select("amount, status, created_at")
      .eq("affiliate_id", affiliateId)

    if (commissionsError) {
      console.error("❌ [DASHBOARD] Erro ao buscar comissões:", commissionsError)
    }

    console.log("💳 [DASHBOARD] Comissões encontradas:", commissions?.length || 0)

    // Calcular métricas do mês atual
    const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
    const monthlyInvestments = investments?.filter((inv) => inv.created_at.startsWith(currentMonth)) || []

    const currentMonthSales = monthlyInvestments.length
    const currentMonthCommission = monthlyInvestments.reduce(
      (sum, inv) => sum + inv.amount * (affiliate.commission_rate || 0.05),
      0,
    )

    // Comissões pendentes
    const pendingCommission =
      commissions?.filter((c) => c.status === "pending").reduce((sum, comm) => sum + comm.amount, 0) || 0

    // Taxa de conversão
    const totalClicks = clickCount || 0
    const totalInvestments = investments?.length || 0
    const conversionRate = totalClicks > 0 ? (totalInvestments / totalClicks) * 100 : 0

    const stats: AffiliateStats = {
      totalSales: totalInvestments,
      totalCommission: affiliate.total_commission || 0,
      pendingCommission,
      totalClicks,
      conversionRate,
      currentMonthSales,
      currentMonthCommission,
    }

    console.log("✅ [DASHBOARD] Estatísticas calculadas:", stats)
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

    // Buscar investimentos como "vendas"
    const { data: investments, error } = await supabase
      .from("investments")
      .select(`
        id,
        created_at,
        amount,
        status,
        users (
          name,
          email
        )
      `)
      .eq("affiliate_id", affiliateId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("❌ [DASHBOARD] Erro ao buscar vendas:", error)
      return []
    }

    console.log("💰 [DASHBOARD] Investimentos encontrados:", investments?.length || 0)

    // Buscar comissões correspondentes
    const investmentIds = investments?.map((inv) => inv.id) || []
    let commissions: any[] = []

    if (investmentIds.length > 0) {
      const { data: commissionsData } = await supabase
        .from("commissions")
        .select("investment_id, amount, status")
        .in("investment_id", investmentIds)

      commissions = commissionsData || []
    }

    const formattedSales: AffiliateSale[] =
      investments?.map((investment) => {
        const commission = commissions?.find((c) => c.investment_id === investment.id)

        return {
          id: investment.id,
          date: new Date(investment.created_at).toLocaleDateString("pt-BR"),
          customerName: investment.users?.name || "Cliente",
          saleValue: investment.amount || 0,
          commission: commission?.amount || investment.amount * 0.05,
          status: commission?.status || "pending",
          product: "AGD Token",
        }
      }) || []

    console.log("✅ [DASHBOARD] Vendas formatadas:", formattedSales.length)
    return formattedSales
  } catch (error) {
    console.error("💥 [DASHBOARD] Erro ao buscar vendas:", error)
    return []
  }
}

export async function getAffiliatePayments(affiliateId: string, limit = 10): Promise<AffiliatePayment[]> {
  try {
    console.log("💳 [DASHBOARD] Buscando pagamentos do afiliado:", affiliateId)

    // Buscar comissões pagas como "pagamentos"
    const { data: commissions, error } = await supabase
      .from("commissions")
      .select(`
        id,
        amount,
        status,
        paid_at,
        payment_method,
        created_at
      `)
      .eq("affiliate_id", affiliateId)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("❌ [DASHBOARD] Erro ao buscar pagamentos:", error)
      return []
    }

    console.log("💳 [DASHBOARD] Comissões pagas encontradas:", commissions?.length || 0)

    const formattedPayments: AffiliatePayment[] =
      commissions?.map((commission) => ({
        id: commission.id,
        date: new Date(commission.paid_at || commission.created_at).toLocaleDateString("pt-BR"),
        amount: commission.amount || 0,
        method: commission.payment_method || "PIX",
        status: "paid",
        reference: `COM-${commission.id.slice(0, 8)}`,
      })) || []

    console.log("✅ [DASHBOARD] Pagamentos formatados:", formattedPayments.length)
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

// Função para registrar clique do afiliado
export async function trackAffiliateClick(affiliateCode: string, destination = "ofertas") {
  try {
    console.log("🔗 [TRACKING] Registrando clique:", { affiliateCode, destination })

    // Buscar ID do afiliado
    const { data: affiliate, error: affiliateError } = await supabase
      .from("affiliates")
      .select("id")
      .eq("affiliate_code", affiliateCode)
      .single()

    if (affiliateError || !affiliate) {
      console.error("❌ [TRACKING] Afiliado não encontrado:", affiliateCode)
      return false
    }

    // Registrar clique na tabela
    const { error: clickError } = await supabase.from("affiliate_clicks").insert({
      affiliate_id: affiliate.id,
      affiliate_code: affiliateCode,
      utm_source: "affiliate",
      utm_medium: "referral",
      utm_campaign: affiliateCode,
      page_destination: destination,
    })

    if (clickError) {
      console.error("❌ [TRACKING] Erro ao registrar clique:", clickError)
      return false
    }

    // Incrementar contador de cliques
    const { error: updateError } = await supabase.rpc("increment_affiliate_clicks", {
      affiliate_code_param: affiliateCode,
    })

    if (updateError) {
      console.error("❌ [TRACKING] Erro ao incrementar cliques:", updateError)
    }

    console.log("✅ [TRACKING] Clique registrado com sucesso")
    return true
  } catch (error) {
    console.error("💥 [TRACKING] Erro no tracking:", error)
    return false
  }
}
