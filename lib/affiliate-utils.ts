"use client"

import { createClient } from "@supabase/supabase-js"

// ================================================================
// Configuração do cliente Supabase (browser-side)
// ================================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// ================================================================
// Tipos e interfaces
// ================================================================
export interface AffiliateStats {
  totalSales: number
  totalCommission: number
  totalClicks: number
  conversionRate: number
  monthlySales: number
  monthlyCommission: number
  pendingCommission: number
  tier: string
  commissionRate: number
}

export interface TierInfo {
  name: string
  rate: number
  color: string
  bgColor: string
  minSales: number
}

// ================================================================
// Armazenamento local
// ================================================================
export function getAffiliateId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("affiliateId")
}

export function setAffiliateId(id: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("affiliateId", id)
}

export function clearAffiliateId(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("affiliateId")
}

// ================================================================
// Validação
// ================================================================
export function isValidAffiliateId(id: string): boolean {
  if (!id || typeof id !== "string") return false
  // 6-10 caracteres, apenas letras/números
  return /^[A-Z0-9]{6,10}$/.test(id)
}

// ================================================================
// Geração e verificação de códigos
// ================================================================
const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

function baseGenerateCode(prefix = "AGD"): string {
  // 3 dígitos do timestamp + 2 chars aleatórios
  const time = Date.now().toString().slice(-3)
  const rand = Array.from({ length: 2 }, () => randomChars.charAt(Math.floor(Math.random() * randomChars.length))).join(
    "",
  )
  return `${prefix}${time}${rand}`
}

/**
 * Gera um código de afiliado de forma síncrona.
 * Mantém compatibilidade com partes antigas do código que ainda importam
 * `generateAffiliateCode` como export nomeado.
 *
 * Exemplo:
 *  generateAffiliateCode("João") -> "JOA123AB"
 */
export function generateAffiliateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "AGD"

  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

export async function isAffiliateCodeUnique(code: string): Promise<boolean> {
  if (!supabase) return true // Assume único sem Supabase
  try {
    const { data, error } = await supabase.from("affiliates").select("id").eq("affiliate_code", code).single()
    // Se erro de "row not found" (PGRST116) ou data indefinido => é único
    return !data
  } catch {
    return false
  }
}

export async function generateUniqueAffiliateCode(maxAttempts = 5): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateAffiliateCode()
    if (await isAffiliateCodeUnique(code)) return code
  }
  // Fallback com timestamp completo
  return `AGD${Date.now().toString().slice(-6)}`
}

// ================================================================
// Links de afiliado
// ================================================================
export function generateAffiliateLink(affiliateCode: string, page = "/"): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agroderi.com"
  const url = new URL(page, baseUrl)
  url.searchParams.set("ref", affiliateCode)
  url.searchParams.set("utm_source", "affiliate")
  url.searchParams.set("utm_medium", "referral")
  url.searchParams.set("utm_campaign", affiliateCode)
  return url.toString()
}

// ================================================================
// Regras de comissão / bônus
// ================================================================
const tierRates = {
  bronze: 0.05,
  silver: 0.07,
  gold: 0.1,
  platinum: 0.12,
  diamond: 0.15,
} as const

export function calculateCommission(saleValue: number, tier = "bronze"): number {
  const tierInfo = getTierInfo(tier)
  return saleValue * tierInfo.rate
}

export function getAffiliateBonus(affiliateId: string, planType: string): number {
  const bonuses = {
    starter: 25,
    intermediate: 75,
    premium: 150,
  } as const
  return bonuses[planType as keyof typeof bonuses] ?? 0
}

// ================================================================
// Informações de tier
// ================================================================
export function getTierInfo(tier: string): TierInfo {
  const tiers: { [key: string]: TierInfo } = {
    bronze: {
      name: "Bronze",
      rate: 0.05, // 5%
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      minSales: 0,
    },
    silver: {
      name: "Prata",
      rate: 0.07, // 7%
      color: "text-gray-700",
      bgColor: "bg-gray-50",
      minSales: 10,
    },
    gold: {
      name: "Ouro",
      rate: 0.1, // 10%
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      minSales: 25,
    },
    platinum: {
      name: "Platina",
      rate: 0.12, // 12%
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      minSales: 50,
    },
    diamond: {
      name: "Diamante",
      rate: 0.15, // 15%
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      minSales: 100,
    },
  }

  return tiers[tier] || tiers.bronze
}

// ================================================================
// Helpers de formatação
// ================================================================
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

// ================================================================
// Estatísticas do afiliado - VERSÃO COM BANCO REAL
// ================================================================
export async function getAffiliateStats(affiliateId: string): Promise<AffiliateStats> {
  if (!supabase) {
    console.warn("Supabase não configurado—retornando mock.")
    return getAffiliateStatsMock()
  }

  try {
    console.log("📊 [STATS] Buscando estatísticas para afiliado:", affiliateId)

    // 1. Buscar dados básicos do afiliado
    const { data: affiliate, error: affiliateError } = await supabase
      .from("affiliates")
      .select("total_sales, total_commission, tier, commission_rate, total_clicks")
      .eq("id", affiliateId)
      .single()

    if (affiliateError) {
      console.error("❌ [STATS] Erro ao buscar afiliado:", affiliateError)
      return getAffiliateStatsMock()
    }

    // 2. Buscar investimentos relacionados ao afiliado
    const { data: investments, error: investmentsError } = await supabase
      .from("investments")
      .select("amount, created_at, status")
      .eq("affiliate_id", affiliateId)

    if (investmentsError) {
      console.error("❌ [STATS] Erro ao buscar investimentos:", investmentsError)
    }

    // 3. Buscar comissões pendentes
    const { data: commissions, error: commissionsError } = await supabase
      .from("commissions")
      .select("amount, status")
      .eq("affiliate_id", affiliateId)

    if (commissionsError) {
      console.error("❌ [STATS] Erro ao buscar comissões:", commissionsError)
    }

    // 4. Calcular métricas do mês atual
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlyInvestments =
      investments?.filter((inv) => {
        const invDate = new Date(inv.created_at)
        return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear
      }) || []

    const monthlySales = monthlyInvestments.reduce((sum, inv) => sum + inv.amount, 0)
    const monthlyCommission = monthlySales * (affiliate.commission_rate || 0.05)

    // 5. Calcular comissões pendentes
    const pendingCommission =
      commissions?.filter((c) => c.status === "pending").reduce((sum, comm) => sum + comm.amount, 0) || 0

    // 6. Calcular taxa de conversão
    const totalClicks = affiliate.total_clicks || 0
    const totalSales = investments?.length || 0
    const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0

    const stats: AffiliateStats = {
      totalSales: affiliate.total_sales || 0,
      totalCommission: affiliate.total_commission || 0,
      totalClicks,
      conversionRate,
      monthlySales,
      monthlyCommission,
      pendingCommission,
      tier: affiliate.tier || "bronze",
      commissionRate: affiliate.commission_rate || 0.05,
    }

    console.log("✅ [STATS] Estatísticas calculadas:", stats)
    return stats
  } catch (err) {
    console.error("💥 [STATS] Erro ao buscar estatísticas:", err)
    return getAffiliateStatsMock()
  }
}

// Função para registrar clique no link de afiliado
export async function trackAffiliateClick(affiliateCode: string, page: string): Promise<void> {
  if (!supabase) return

  try {
    // Buscar ID do afiliado pelo código
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .eq("affiliate_code", affiliateCode)
      .single()

    if (affiliate) {
      // Incrementar contador de cliques
      await supabase
        .from("affiliates")
        .update({
          total_clicks: supabase.raw("total_clicks + 1"),
          updated_at: new Date().toISOString(),
        })
        .eq("id", affiliate.id)

      // Registrar evento de clique
      await supabase.from("event_logs").insert({
        event_name: "affiliate_click",
        event_data: {
          affiliate_code: affiliateCode,
          page,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      })

      console.log("📈 [TRACKING] Clique registrado para:", affiliateCode)
    }
  } catch (error) {
    console.error("❌ [TRACKING] Erro ao registrar clique:", error)
  }
}

function getAffiliateStatsMock(): AffiliateStats {
  return {
    totalSales: 10000,
    totalCommission: 500,
    totalClicks: 1000,
    conversionRate: 0.05,
    monthlySales: 2000,
    monthlyCommission: 100,
    pendingCommission: 200,
    tier: "bronze",
    commissionRate: 0.05,
  }
}

// ================================================================
// Funções adicionais
// ================================================================
export function getNextTier(
  currentTier: string,
  currentSales: number,
): { nextTier: string; salesNeeded: number } | null {
  const tiers = ["bronze", "silver", "gold", "platinum", "diamond"]
  const currentIndex = tiers.indexOf(currentTier)

  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return null // Já está no tier mais alto
  }

  const nextTier = tiers[currentIndex + 1]
  const nextTierInfo = getTierInfo(nextTier)
  const salesNeeded = Math.max(0, nextTierInfo.minSales - currentSales)

  return {
    nextTier: nextTierInfo.name,
    salesNeeded,
  }
}
