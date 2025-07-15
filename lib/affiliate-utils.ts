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
  color: string
  rate: number
  minSales: number
  benefits: string[]
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
export function generateAffiliateCode(name = ""): string {
  // Limpa e garante pelo menos 3 letras
  const clean = name
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .padEnd(3, "X")
    .substring(0, 3)
  return baseGenerateCode(clean)
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

export async function generateUniqueAffiliateCode(name = "", maxAttempts = 5): Promise<string> {
  const cleanName = name
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .padEnd(3, "X")
    .substring(0, 3)

  for (let i = 0; i < maxAttempts; i++) {
    const code = baseGenerateCode(cleanName)
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
  platinum: 0.15,
  standard: 0.05,
  premium: 0.1,
} as const

export function calculateCommission(amount: number, tier = "bronze"): number {
  const rate = tierRates[tier as keyof typeof tierRates] ?? 0.05
  return amount * rate
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
    tiers[tier] ?? {
      name: "Bronze",
      color: "#CD7F32",
      rate: 0.05,
      minSales: 0,
      benefits: ["5% de comissão"],
    }
  )
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
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value)
}

// ================================================================
// Estatísticas do afiliado
// ================================================================
export async function getAffiliateStats(affiliateId: string): Promise<AffiliateStats> {
  if (!supabase) {
    console.warn("Supabase não configurado—retornando mock.")
    return getAffiliateStatsMock()
  }

  try {
    // Info do afiliado
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("total_sales, total_commission, tier, commission_rate")
      .eq("id", affiliateId)
      .single()

    // Investimentos
    const { data: investments } = await supabase
      .from("investments")
      .select("amount, created_at")
      .eq("affiliate_id", affiliateId)

    // Comissões pendentes
    const { data: pending } = await supabase
      .from("commissions")
      .select("amount")
      .eq("affiliate_id", affiliateId)
      .eq("status", "pending")

    const month = new Date().getMonth()
    const year = new Date().getFullYear()

    const monthlyInvestments =
      investments?.filter((inv) => {
        const d = new Date(inv.created_at)
        return d.getMonth() === month && d.getFullYear() === year
      }) ?? []

    const monthlySales = monthlyInvestments.reduce((sum, i) => sum + i.amount, 0)

    const commissionRate = affiliate?.commission_rate ?? 0.05
    const monthlyCommission = monthlySales * commissionRate
    const pendingCommission = pending?.reduce((sum, p) => sum + p.amount, 0) ?? 0

    const totalClicks = Math.floor((affiliate?.total_sales ?? 0) * 0.1) || 100
    const conversionRate = totalClicks > 0 ? (investments?.length ?? 0) / totalClicks : 0

    return {
      totalSales: affiliate?.total_sales ?? 0,
      totalCommission: affiliate?.total_commission ?? 0,
      totalClicks,
      conversionRate,
      monthlySales,
      monthlyCommission,
      pendingCommission,
      tier: affiliate?.tier ?? "bronze",
      commissionRate,
    }
  } catch (err) {
    console.error("Falha em getAffiliateStats:", err)
    return getAffiliateStatsMock()
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
