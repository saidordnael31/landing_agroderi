/**
 * Utilitários centrais do sistema de afiliados Agroderi
 * (cookies / localStorage, geração de código, métricas, etc.)
 */

/* ------------------------------------------------------------------ */
/* -------------------------- Cookies & Storage ---------------------- */
/* ------------------------------------------------------------------ */

/**
 * Recupera o ID do afiliado salvo (cookie ou localStorage).
 * — Expira em 48 h caso esteja apenas no localStorage.
 */
export function getAffiliateId(): string | null {
  if (typeof window === "undefined") return null

  // 1. Tenta cookie
  const cookieEntry = document.cookie.split(";").find((c) => c.trim().startsWith("id_afiliado="))

  if (cookieEntry) {
    return cookieEntry.split("=")[1]
  }

  // 2. Tenta localStorage
  const lsId = localStorage.getItem("agd_affiliate_id")
  const ts = localStorage.getItem("agd_affiliate_timestamp")

  if (lsId && ts) {
    const storedAt = Number(ts)
    const now = Date.now()
    const ttl = 48 * 60 * 60 * 1000 // 48 h

    if (now - storedAt < ttl) {
      return lsId
    }

    // Expirado → limpa
    localStorage.removeItem("agd_affiliate_id")
    localStorage.removeItem("agd_affiliate_timestamp")
  }

  return null
}

/**
 * Armazena o ID de afiliado em cookie + localStorage (backup).
 */
export function setAffiliateId(id: string): void {
  if (typeof window === "undefined") return

  const maxAge = 48 * 60 * 60 // 48 h em s
  document.cookie = `id_afiliado=${id}; path=/; max-age=${maxAge}; SameSite=Lax`

  localStorage.setItem("agd_affiliate_id", id)
  localStorage.setItem("agd_affiliate_timestamp", Date.now().toString())
}

/** Limpa o ID de afiliado salvo. */
export function clearAffiliateId(): void {
  if (typeof window === "undefined") return

  document.cookie = "id_afiliado=; path=/; max-age=0"
  localStorage.removeItem("agd_affiliate_id")
  localStorage.removeItem("agd_affiliate_timestamp")
}

/* ------------------------------------------------------------------ */
/* ------------------------- Geração de Código ----------------------- */
/* ------------------------------------------------------------------ */

/**
 * Gera um código único de afiliado.
 * Formato: <slug-do-nome><4 dígitos timestamp><3 caracteres aleatórios>
 */
export function generateAffiliateCode(name?: string): string {
  const slug =
    name
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 3)
      .toUpperCase() || "AGD"

  const timestamp = Date.now().toString().slice(-4)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()

  return `${slug}${timestamp}${random}`
}

/** Valida formatação do código. */
export function isValidAffiliateId(id: string): boolean {
  return /^[A-Z0-9]{10}$/.test(id)
}

/* ------------------------------------------------------------------ */
/* ------------------------- Métricas & Links ------------------------ */
/* ------------------------------------------------------------------ */

/** Placeholder de estatísticas – em produção seria fetch na API. */
export function getAffiliateStats(affiliateId: string) {
  return {
    totalReferrals: Math.floor(Math.random() * 150) + 10,
    totalEarnings: Math.floor(Math.random() * 6000) + 500,
    conversionRate: (Math.random() * 10 + 2).toFixed(1),
    tier: affiliateId.length > 6 ? "gold" : "bronze",
  }
}

/** Gera link de rastreio para páginas internas. */
export function generateAffiliateLink(affiliateId: string, page = "ofertas"): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://agroderi.com"
  return `${base}/rastreio?utm_id=${affiliateId}&utm_source=affiliate&utm_campaign=referral&redirect=${page}`
}

/** Calcula bônus extra por plano + tier. */
export function getAffiliateBonus(affiliateId: string, planType: string): number {
  const stats = getAffiliateStats(affiliateId)

  const base =
    {
      plano1: 2,
      plano2: 3,
      plano3: 5,
    }[planType as keyof typeof base] ?? 2

  const multiplier = stats.tier === "gold" ? 1.5 : 1
  return Math.floor(base * multiplier)
}

/* ------------------------------------------------------------------ */
/* ----------------------- Helpers de Formatação --------------------- */
/* ------------------------------------------------------------------ */

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatPercentage(val: number): string {
  return `${val.toFixed(1)}%`
}

/* ----------------------- Comissão & Tier -------------------------- */

export function calculateCommission(amount: number, tier = "bronze"): number {
  const rates = { bronze: 0.05, silver: 0.08, gold: 0.12, platinum: 0.15 }
  const r = rates[tier as keyof typeof rates] ?? rates.bronze
  return amount * r
}

export function getTierInfo(tier: string) {
  const tiers = {
    bronze: { name: "Bronze", rate: 0.05, color: "text-orange-600", bg: "bg-orange-50" },
    silver: { name: "Prata", rate: 0.08, color: "text-gray-600", bg: "bg-gray-50" },
    gold: { name: "Ouro", rate: 0.12, color: "text-yellow-600", bg: "bg-yellow-50" },
    platinum: { name: "Platina", rate: 0.15, color: "text-purple-600", bg: "bg-purple-50" },
  }
  return tiers[tier as keyof typeof tiers] ?? tiers.bronze
}
