"use client"

/**
 * Utils relacionados a afiliados.
 * Todas as funções exigidas pelo projeto estão declaradas aqui.
 */

import { createBrowserClient } from "@supabase/supabase-js"

/* -------------------------------------------------------------------------- */
/*  Tipagens                                                                  */
/* -------------------------------------------------------------------------- */

export interface AffiliateStats {
  totalSales: number
  totalCommission: number
  clicks: number
  conversionRate: number
  monthlySales: number
  monthlyCommission: number
}

export interface TierInfo {
  tier: "Bronze" | "Prata" | "Ouro" | "Platina"
  rate: number // comissão (0‒1)
  minSales: number
}

/* -------------------------------------------------------------------------- */
/*  Variáveis internas                                                        */
/* -------------------------------------------------------------------------- */

const AFFILIATE_ID_KEY = "affiliateId"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

/* -------------------------------------------------------------------------- */
/*  Supabase Client (somente browser)                                         */
/* -------------------------------------------------------------------------- */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase =
  typeof window !== "undefined" && supabaseUrl && supabaseAnonKey
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : null

/* -------------------------------------------------------------------------- */
/*  Geração e validação de código de afiliado                                 */
/* -------------------------------------------------------------------------- */

export function generateAffiliateCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < length; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function isValidAffiliateId(id: string | null | undefined): boolean {
  return !!id && /^[A-Z0-9]{6,12}$/.test(id)
}

/* -------------------------------------------------------------------------- */
/*  Persistência no localStorage                                              */
/* -------------------------------------------------------------------------- */

export function getAffiliateId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AFFILIATE_ID_KEY)
}

export function setAffiliateId(id: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(AFFILIATE_ID_KEY, id)
}

export function clearAffiliateId() {
  if (typeof window === "undefined") return
  localStorage.removeItem(AFFILIATE_ID_KEY)
}

/* -------------------------------------------------------------------------- */
/*  Formatação                                                                 */
/* -------------------------------------------------------------------------- */

export function formatCurrency(value: number, locale = "pt-BR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatPercentage(value: number, locale = "pt-BR"): string {
  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}%`
}

/* -------------------------------------------------------------------------- */
/*  Tiers e comissão                                                          */
/* -------------------------------------------------------------------------- */

const TIERS: TierInfo[] = [
  { tier: "Bronze", rate: 0.05, minSales: 0 },
  { tier: "Prata", rate: 0.07, minSales: 50 },
  { tier: "Ouro", rate: 0.1, minSales: 150 },
  { tier: "Platina", rate: 0.15, minSales: 300 },
]

export function getTierInfo(totalSales: number): TierInfo {
  // Pega o maior tier cujo minSales seja <= totalSales
  return [...TIERS].reverse().find((t) => totalSales >= t.minSales) ?? TIERS[0]
}

export function calculateCommission(sales: number, totalSales: number): number {
  const { rate } = getTierInfo(totalSales)
  return sales * rate
}

/* -------------------------------------------------------------------------- */
/*  Links e bônus                                                             */
/* -------------------------------------------------------------------------- */

export function generateAffiliateLink(affiliateId: string): string {
  if (!isValidAffiliateId(affiliateId)) return SITE_URL
  const url = new URL(SITE_URL)
  url.searchParams.set("ref", affiliateId)
  return url.toString()
}

export function getAffiliateBonus(totalSales: number): number {
  // Exemplo de bônus simples: R$100 a cada 100 vendas
  return Math.floor(totalSales / 100) * 100
}

/* -------------------------------------------------------------------------- */
/*  Estatísticas do banco (Supabase RPC ou view)                              */
/* -------------------------------------------------------------------------- */

export async function getAffiliateStats(affiliateId: string): Promise<AffiliateStats | null> {
  if (!supabase || !affiliateId) return null

  // Exemplo: view materializada ou função RPC chamada "affiliate_stats"
  const { data, error } = await supabase
    .from("affiliate_stats")
    .select("total_sales, total_commission, clicks, conversion_rate, monthly_sales, monthly_commission")
    .eq("affiliate_id", affiliateId)
    .single()

  if (error || !data) {
    console.error("[AffiliateStats] Supabase error:", error)
    return null
  }

  return {
    totalSales: data.total_sales,
    totalCommission: data.total_commission,
    clicks: data.clicks,
    conversionRate: data.conversion_rate,
    monthlySales: data.monthly_sales,
    monthlyCommission: data.monthly_commission,
  }
}
