// Utilitários para gerenciar afiliados
export function getAffiliateId(): string | null {
  if (typeof window === "undefined") return null

  // Primeiro tenta pegar do cookie
  const cookies = document.cookie.split(";")
  const affiliateCookie = cookies.find((cookie) => cookie.trim().startsWith("id_afiliado="))

  if (affiliateCookie) {
    return affiliateCookie.split("=")[1]
  }

  // Se não encontrar no cookie, tenta no localStorage
  const localStorageId = localStorage.getItem("agd_affiliate_id")
  const timestamp = localStorage.getItem("agd_affiliate_timestamp")

  if (localStorageId && timestamp) {
    const now = Date.now()
    const storedTime = Number.parseInt(timestamp)
    const fortyEightHours = 48 * 60 * 60 * 1000 // 48 horas em ms

    // Verifica se ainda está dentro do prazo
    if (now - storedTime < fortyEightHours) {
      return localStorageId
    } else {
      // Remove dados expirados
      localStorage.removeItem("agd_affiliate_id")
      localStorage.removeItem("agd_affiliate_timestamp")
    }
  }

  return null
}

export function setAffiliateId(affiliateId: string): void {
  if (typeof window === "undefined") return

  // Define cookie
  const maxAge = 60 * 60 * 48 // 48 horas
  document.cookie = `id_afiliado=${affiliateId}; path=/; max-age=${maxAge}; SameSite=Lax`

  // Define localStorage como backup
  localStorage.setItem("agd_affiliate_id", affiliateId)
  localStorage.setItem("agd_affiliate_timestamp", Date.now().toString())
}

export function clearAffiliateId(): void {
  if (typeof window === "undefined") return

  // Remove cookie
  document.cookie = "id_afiliado=; path=/; max-age=0"

  // Remove localStorage
  localStorage.removeItem("agd_affiliate_id")
  localStorage.removeItem("agd_affiliate_timestamp")
}

export function trackAffiliateConversion(affiliateId: string, conversionType: string, value?: number): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "affiliate_conversion", {
      affiliate_id: affiliateId,
      conversion_type: conversionType,
      value: value || 0,
      currency: "BRL",
    })
  }

  // Aqui você pode adicionar chamada para sua API de tracking
  // fetch('/api/affiliate/track', { ... })
}

// Adicione estas funções ao final do arquivo

export function getAffiliateStats(affiliateId: string) {
  // Simula busca de estatísticas do afiliado
  // Em produção, isso seria uma chamada para sua API
  return {
    totalReferrals: Math.floor(Math.random() * 100) + 10,
    totalEarnings: Math.floor(Math.random() * 5000) + 500,
    conversionRate: (Math.random() * 10 + 2).toFixed(1),
    tier: affiliateId.length > 6 ? "Premium" : "Standard",
  }
}

export function generateAffiliateLink(affiliateId: string, page = "ofertas"): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://agroderi.com"
  return `${baseUrl}/rastreio?utm_id=${affiliateId}&utm_source=affiliate&utm_campaign=referral&redirect=${page}`
}

export function isValidAffiliateId(affiliateId: string): boolean {
  // Valida formato do ID do afiliado
  return /^[A-Za-z0-9]{4,20}$/.test(affiliateId)
}

export function getAffiliateBonus(affiliateId: string, planType: string): number {
  const stats = getAffiliateStats(affiliateId)

  // Bônus baseado no tier do afiliado
  const baseBonuses = {
    plano1: 2,
    plano2: 3,
    plano3: 5,
  }

  const tierMultiplier = stats.tier === "Premium" ? 1.5 : 1
  return Math.floor((baseBonuses[planType] || 2) * tierMultiplier)
}
