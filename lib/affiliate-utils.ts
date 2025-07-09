"use client"

/**
 * Utilidades de afiliados usadas em todo o front-end.
 * Centraliza geração de códigos, link, métricas, formatação etc.
 */

import { createBrowserClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase" // ajuste caso seu tipo esteja em outro lugar

/* -------------------------------------------------------------------------- */
/*                              CONFIG SUPABASE                              */
/* -------------------------------------------------------------------------- */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Isto será capturado apenas em desenvolvimento; em produção as envs estão definidas.
  // eslint-disable-next-line no-console
  console.warn("[affiliate-utils] Variáveis NEXT_PUBLIC_SUPABASE_URL ou _ANON_KEY ausentes.")
}

// Client só é criado no browser.
const supabase = createBrowserClient<Database>(supabaseUrl ?? "", supabaseAnonKey ?? "")

/* -------------------------------------------------------------------------- */
/*                        LOCAL-STORAGE HELPERS (ID)                         */
/* -------------------------------------------------------------------------- */

const LS_KEY = "agd_affiliate_id"

export function getAffiliateId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(LS_KEY)
}

export function setAffiliateId(code: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(LS_KEY, code)
}

export function clearAffiliateId(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(LS_KEY)
}

export function isValidAffiliateId(code: string | null | undefined): boolean {
  if (!code) return false
  // 5–10 caracteres alfanuméricos
  return /^[a-zA-Z0-9]{5,10}$/.test(code)
}

/* -------------------------------------------------------------------------- */
/*                       GERAÇÃO/FORMATAÇÃO DE CÓDIGO                         */
/* -------------------------------------------------------------------------- */

export function generateAffiliateCode(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let out = ""
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export function generateAffiliateLink(code: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://agroderi.com" // fallback para SSR
  return `${base}/?ref=${code}`
}

/* -------------------------------------------------------------------------- */
/*                              FORMATAÇÕES UX                               */
/* -------------------------------------------------------------------------- */

export function formatCurrency(value: number, locale = "pt-BR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatPercentage(value: number, locale = "pt-BR"): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value)
}

/* -------------------------------------------------------------------------- */
/*                                 TIERS                                     */
/* -------------------------------------------------------------------------- */

const tiers = [
  { name: "Bronze", minSales: 0, commission: 0.05 },
  { name: "Prata", minSales: 50, commission: 0.07 },
  { name: "Ouro", minSales: 200, commission: 0.1 },
  { name: "Platina", minSales: 500, commission: 0.12 },
] as const

export type TierInfo = (typeof tiers)[number]

export function getTierInfo(totalSales: number): TierInfo {
  // Encontra o maior tier cujo minSales seja <= totalSales
  return [...tiers].reverse().find((t) => totalSales >= t.minSales) || tiers[0]
}

/* -------------------------------------------------------------------------- */
/*                         MÉTRICAS & COMISSÕES (DB)                          */
/* -------------------------------------------------------------------------- */

export interface AffiliateStats {
  totalSales: number
  totalRevenue: number
  totalCommission: number
  thisMonthSales: number
  thisMonthCommission: number
  pendingCommission: number
}

export async function getAffiliateStats(affiliateId: string): Promise<AffiliateStats> {
  // Exemplo de estrutura no Supabase:
  // - Tabela "sales" com colunas: id, affiliate_id, amount, commission, paid (bool), created_at
  // Ajuste para o seu schema real.
  const { data, error } = await supabase
    .from("sales")
    .select("amount, commission, paid, created_at")
    .eq("affiliate_id", affiliateId)

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[affiliate-utils] getAffiliateStats error", error)
    throw new Error("Falha ao buscar métricas")
  }

  let totalSales = 0
  let totalRevenue = 0
  let totalCommission = 0
  let thisMonthSales = 0
  let thisMonthCommission = 0
  let pendingCommission = 0

  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  data?.forEach((sale) => {
    totalSales += 1
    totalRevenue += sale.amount
    totalCommission += sale.commission

    const saleDate = new Date(sale.created_at)
    if (saleDate.getMonth() === month && saleDate.getFullYear() === year) {
      thisMonthSales += 1
      thisMonthCommission += sale.commission
    }

    if (!sale.paid) {
      pendingCommission += sale.commission
    }
  })

  return {
    totalSales,
    totalRevenue,
    totalCommission,
    thisMonthSales,
    thisMonthCommission,
    pendingCommission,
  }
}

/**
 * Calcula bônus extra baseado em metas específicas.
 * Exemplo: +R$200 se ultrapassar 100 vendas no mês.
 */
export function getAffiliateBonus(stats: AffiliateStats): number {
  if (stats.thisMonthSales >= 100) return 200
  if (stats.thisMonthSales >= 50) return 50
  return 0
}

/* -------------------------------------------------------------------------- */
/*                          CÁLCULO DE COMISSÃO EXTRA                         */
/* -------------------------------------------------------------------------- */

export function calculateCommission(saleAmount: number, affiliateId: string, totalSalesForAffiliate: number): number {
  const tier = getTierInfo(totalSalesForAffiliate)
  return saleAmount * tier.commission
}
