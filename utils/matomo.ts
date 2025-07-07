// Utilitários para rastreamento com Matomo Analytics

interface MatomoEvent {
  category: string
  action: string
  name?: string
  value?: number
}

// Função para rastrear eventos
export function trackEvent(category: string, action: string, name?: string, value?: number) {
  // Se estiver no servidor, não fazer nada
  if (typeof window === "undefined") return

  try {
    // Verificar se o Matomo está carregado
    if (typeof window._paq !== "undefined") {
      window._paq.push(["trackEvent", category, action, name, value])
    } else {
      // Fallback para Google Analytics se disponível
      if (typeof window.gtag !== "undefined") {
        window.gtag("event", action, {
          event_category: category,
          event_label: name,
          value: value,
        })
      }
    }
  } catch (error) {
    console.warn("Erro ao rastrear evento:", error)
  }
}

// Função para rastrear visualizações de página
export function trackPageView(url?: string) {
  if (typeof window === "undefined") return

  try {
    if (typeof window._paq !== "undefined") {
      if (url) {
        window._paq.push(["setCustomUrl", url])
      }
      window._paq.push(["trackPageView"])
    }
  } catch (error) {
    console.warn("Erro ao rastrear página:", error)
  }
}

// Função para rastrear conversões
export function trackConversion(goalId: number, revenue?: number) {
  if (typeof window === "undefined") return

  try {
    if (typeof window._paq !== "undefined") {
      window._paq.push(["trackGoal", goalId, revenue])
    }
  } catch (error) {
    console.warn("Erro ao rastrear conversão:", error)
  }
}

// Eventos específicos do Agroderi
export const AgroEvents = {
  // Landing page
  viewLandingPage: () => trackEvent("Landing", "View", "Homepage"),
  clickCTA: (location: string) => trackEvent("Landing", "Click CTA", location),

  // Afiliados
  affiliateSignup: () => trackEvent("Affiliate", "Signup"),
  affiliateLogin: () => trackEvent("Affiliate", "Login"),
  generateAffiliateLink: () => trackEvent("Affiliate", "Generate Link"),

  // Investimentos
  viewPlans: () => trackEvent("Investment", "View Plans"),
  selectPlan: (planId: string) => trackEvent("Investment", "Select Plan", planId),
  startPayment: (planId: string, amount: number) => trackEvent("Investment", "Start Payment", planId, amount),
  completePayment: (planId: string, amount: number) => trackEvent("Investment", "Complete Payment", planId, amount),

  // Missões
  viewMissions: () => trackEvent("Mission", "View"),
  startMission: (step: string) => trackEvent("Mission", "Start", step),
  completeMission: (step: string) => trackEvent("Mission", "Complete", step),
  claimReward: (amount: number) => trackEvent("Mission", "Claim Reward", "Airdrop", amount),

  // Admin
  viewDashboard: (role: string) => trackEvent("Admin", "View Dashboard", role),
  exportData: (type: string) => trackEvent("Admin", "Export", type),
}

// Declarações TypeScript para window
declare global {
  interface Window {
    _paq: any[]
    gtag: (...args: any[]) => void
  }
}
