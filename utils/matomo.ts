// Configuração do Matomo/Google Analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// Função para rastrear eventos
export function trackEvent(action: string, category = "general", label?: string, value?: number) {
  try {
    // Google Analytics 4
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }

    // Console log para debug
    console.log("📊 Evento rastreado:", { action, category, label, value })
  } catch (error) {
    console.error("Erro ao rastrear evento:", error)
  }
}

// Função para rastrear visualizações de página
export function trackPageView(url: string, title?: string) {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
        page_location: url,
        page_title: title,
      })
    }

    console.log("📄 Página rastreada:", { url, title })
  } catch (error) {
    console.error("Erro ao rastrear página:", error)
  }
}

// Função para rastrear conversões
export function trackConversion(action: string, value?: number, currency = "BRL") {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "conversion", {
        send_to: process.env.NEXT_PUBLIC_GA_ID,
        event_category: "ecommerce",
        event_label: action,
        value: value,
        currency: currency,
      })
    }

    console.log("💰 Conversão rastreada:", { action, value, currency })
  } catch (error) {
    console.error("Erro ao rastrear conversão:", error)
  }
}

// Função para identificar usuário
export function identifyUser(userId: string, properties?: Record<string, any>) {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
        user_id: userId,
        custom_map: properties,
      })
    }

    console.log("👤 Usuário identificado:", { userId, properties })
  } catch (error) {
    console.error("Erro ao identificar usuário:", error)
  }
}
