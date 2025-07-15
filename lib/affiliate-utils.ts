"use client"

import { createClient } from "@supabase/supabase-js"

// Cliente Supabase para o browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

let supabase: any = null
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

// ==================== TIPOS E INTERFACES ====================

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
  color: string
  rate: number
  minSales: number
  benefits: string[]
}

// ==================== FUNÇÕES DE ARMAZENAMENTO LOCAL ====================

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

// ==================== VALIDAÇÃO ====================

export function isValidAffiliateId(id: string): boolean {
  if (!id || typeof id !== "string") return false
  // Código deve ter entre 6-10 caracteres, apenas letras e números
  return /^[A-Z0-9]{6,10}$/.test(id)
}

// ==================== GERAÇÃO DE CÓDIGO ÚNICO ====================

export function generateAffiliateCode(name: string): string {
  if (!name || typeof name !== "string") {
    return generateRandomCode()
  }

  // Limpar nome e pegar primeiras 3 letras
  const cleanName = name.replace(/[^a-zA-Z]/g, "").toUpperCase()
  const namePrefix = cleanName.substring(0, 3).padEnd(3, "X")

  // Gerar timestamp único (últimos 3 dígitos + random)
  const timestamp = Date.now().toString()
  const timeDigits = timestamp.slice(-3)
  const randomDigit = Math.floor(Math.random() * 10)

  return `${namePrefix}${timeDigits}${randomDigit}`
}

function generateRandomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = "AGD"

  // Adicionar timestamp para garantir unicidade
  const timestamp = Date.now().toString().slice(-4)

  // Adicionar 2 caracteres aleatórios
  for (let i = 0; i < 2; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return code + timestamp.slice(-3)
}

// Função para verificar se código já existe (para uso futuro)
export async function isAffiliateCodeUnique(code: string): Promise<boolean> {
  if (!supabase || !code) return false

  try {
    const { data, error } = await supabase.from("affiliates").select("id").eq("affiliate_code", code).single()

    // Se não encontrou nenhum registro, o código é único
    return error?.code === "PGRST116" // No rows found
  } catch {
    return false
  }
}

// Função para gerar código único garantido
export async function generateUniqueAffiliateCode(name: string, maxAttempts = 5): Promise<string> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const code = generateAffiliateCode(name)

    if (await isAffiliateCodeUnique(code)) {
      console.log(`✅ Código único gerado na tentativa ${attempt}: ${code}`)
      return code
    }

    console.log(`⚠️ Código ${code} já existe, tentativa ${attempt}/${maxAttempts}`)

    // Aguardar um pouco antes da próxima tentativa
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // Se todas as tentativas falharam, gerar um código com timestamp mais específico
  const fallbackCode = `AGD${Date.now().toString().slice(-6)}`
  console.log(`🔄 Usando código fallback: ${fallbackCode}`)
  return fallbackCode
}

// ==================== LINKS DE AFILIADO ====================

export function generateAffiliateLink(affiliateCode: string, page = "/"): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agroderi.com"
  const url = new URL(page, baseUrl)

  url.searchParams.set("ref", affiliateCode)
  url.searchParams.set("utm_source", "affiliate")
  url.searchParams.set("utm_medium", "referral")
  url.searchParams.set("utm_campaign", affiliateCode)

  return url.toString()
}

// ==================== CÁLCULOS DE COMISSÃO ====================

export function calculateCommission(amount: number, tier = "bronze"): number {
  const tierRates = {
    bronze: 0.05, // 5%
    silver: 0.07, // 7%
    gold: 0.1, // 10%
    platinum: 0.15, // 15%
    standard: 0.05, // 5% (compatibilidade)
    premium: 0.1, // 10% (compatibilidade)
  }

  const rate = tierRates[tier as keyof typeof tierRates] || 0.05
  return amount * rate
}

export function getAffiliateBonus(affiliateId: string, planType: string): number {
  // Valores de bônus por plano
  const bonuses = {
    starter: 25, // R$ 25
    intermediate: 75, // R$ 75
    premium: 150, // R$ 150
    plano1: 50, // R$ 50
    plano2: 100, // R$ 100
    plano3: 200, // R$ 200
  }

  return bonuses[planType as keyof typeof bonuses] || 0
}

// ==================== INFORMAÇÕES DE TIER ====================

export function getTierInfo(tier: string): TierInfo {
  const tiers: Record<string, TierInfo> = {
    bronze: {
      name: "Bronze",
      color: "#CD7F32",
      rate: 0.05,
      minSales: 0,
      benefits: ["5% de comissão", "Suporte básico", "Materiais padrão"],
    },
    silver: {
      name: "Prata",
      color: "#C0C0C0",
      rate: 0.07,
      minSales: 10000,
      benefits: ["7% de comissão", "Suporte prioritário", "Materiais exclusivos"],
    },
    gold: {
      name: "Ouro",
      color: "#FFD700",
      rate: 0.1,
      minSales: 50000,
      benefits: ["10% de comissão", "Suporte VIP", "Treinamentos exclusivos"],
    },
    platinum: {
      name: "Platina",
      color: "#E5E4E2",
      rate: 0.15,
      minSales: 100000,
      benefits: ["15% de comissão", "Gerente dedicado", "Eventos exclusivos"],
    },
    standard: {
      name: "Padrão",
      color: "#6B7280",
      rate: 0.05,
      minSales: 0,
      benefits: ["5% de comissão", "Suporte básico"],
    },
    premium: {
      name: "Premium",
      color: "#8B5CF6",
      rate: 0.1,
      minSales: 25000,
      benefits: ["10% de comissão", "Suporte premium"],
    },
  }

  return (
    tiers[tier] || {
      name: "Bronze",
      color: "#CD7F32",
      rate: 0.05,
      minSales: 0,
      benefits: ["5% de comissão"],
    }
  )
}

// ==================== FORMATAÇÃO ====================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value)
}

// ==================== ESTATÍSTICAS DO AFILIADO ====================

export async function getAffiliateStats(affiliateId: string): Promise<AffiliateStats> {
  if (!supabase) {
    console.warn("Supabase não configurado, retornando dados mock")
    return getAffiliateStatsSync(affiliateId)
  }

  try {
    // Buscar dados do afiliado
    const { data: affiliate, error: affiliateError } = await supabase
      .from("affiliates")
      .select("total_sales, total_commission, tier, commission_rate")
      .eq("id", affiliateId)
      .single()

    if (affiliateError || !affiliate) {
      console.error("Erro ao buscar afiliado:", affiliateError)
      return getAffiliateStatsSync(affiliateId)
    }

    // Buscar investimentos do afiliado
    const { data: investments, error: investmentsError } = await supabase
      .from("investments")
      .select("amount, status, created_at")
      .eq("affiliate_id", affiliateId)

    if (investmentsError) {
      console.error("Erro ao buscar investimentos:", investmentsError)
    }

    // Buscar comissões pendentes
    const { data: pendingCommissions, error: commissionsError } = await supabase
      .from("commissions")
      .select("amount")
      .eq("affiliate_id", affiliateId)
      .eq("status", "pending")

    if (commissionsError) {
      console.error("Erro ao buscar comissões:", commissionsError)
    }

    // Calcular métricas
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyInvestments =
      investments?.filter((inv) => {
        const invDate = new Date(inv.created_at)
        return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear
      }) || []

    const monthlySales = monthlyInvestments.reduce((sum, inv) => sum + inv.amount, 0)
    const monthlyCommission = monthlySales * (affiliate.commission_rate || 0.05)

    const pendingCommission = pendingCommissions?.reduce((sum, comm) => sum + comm.amount, 0) || 0

    // Simular cliques (em produção, isso viria de uma tabela de tracking)
    const totalClicks = Math.floor(affiliate.total_sales * 0.1) || 100
    const conversionRate = totalClicks > 0 ? (investments?.length || 0) / totalClicks : 0

    return {
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
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return getAffiliateStatsSync(affiliateId)
  }
}

// Função síncrona para dados mock (fallback)
function getAffiliateStatsSync(affiliateId: string): AffiliateStats {
  return {
    totalSales: 15000,
    totalCommission: 750,
    totalClicks: 1500,
    conversionRate: 0.05,
    monthlySales: 3000,
    monthlyCommission: 150,
    pendingCommission: 300,
    tier: "bronze",
    commissionRate: 0.05,
  }
}
