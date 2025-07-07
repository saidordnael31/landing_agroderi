// Utilitários para rastreamento Matomo/Google Analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    _paq?: any[]
  }
}

export function trackEvent(action: string, category = "general", label?: string, value?: number) {
  // Google Analytics 4
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }

  // Matomo
  if (typeof window !== "undefined" && window._paq) {
    window._paq.push(["trackEvent", category, action, label, value])
  }

  // Console log para debug
  console.log("Event tracked:", { action, category, label, value })
}

export function trackPageView(url?: string) {
  const page = url || window.location.pathname

  // Google Analytics 4
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
      page_path: page,
    })
  }

  // Matomo
  if (typeof window !== "undefined" && window._paq) {
    window._paq.push(["setCustomUrl", page])
    window._paq.push(["trackPageView"])
  }
}

export function trackConversion(value: number, currency = "BRL") {
  // Google Analytics 4 - Purchase Event
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: `TXN_${Date.now()}`,
      value: value,
      currency: currency,
    })
  }

  // Matomo - Goal Conversion
  if (typeof window !== "undefined" && window._paq) {
    window._paq.push(["trackGoal", 1, value])
  }
}
