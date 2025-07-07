// Cliente para fazer chamadas para as APIs
class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api${endpoint}`
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      throw error
    }
  }

  // Autenticação
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  // Afiliados
  async registerAffiliate(data: { name: string; email: string; phone: string; cpf?: string }) {
    return this.request("/affiliates/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getAffiliateStats(token: string) {
    return this.request("/affiliates/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Investimentos
  async createInvestment(data: {
    name: string
    email: string
    phone: string
    cpf?: string
    planId: string
    amount: number
    affiliateCode?: string
    utmSource?: string
    paymentMethod?: string
  }) {
    return this.request("/investments/create", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getUserInvestments(token: string) {
    return this.request("/investments/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Missões
  async submitMissionStep(data: { email: string; walletAddress: string; step: string; proof?: string }) {
    return this.request("/missions/submit", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getMissionStatus(email: string) {
    return this.request(`/missions/status?email=${encodeURIComponent(email)}`)
  }

  // Admin
  async getAdminDashboard(token: string) {
    return this.request("/admin/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Utilitários
  async trackEvent(eventName: string, eventData: any) {
    return this.request("/analytics/track", {
      method: "POST",
      body: JSON.stringify({ event_name: eventName, event_data: eventData }),
    })
  }
}

// Instância singleton
export const apiClient = new ApiClient()

// Hooks para React (opcional)
export function useApiClient() {
  return apiClient
}

// Tipos para TypeScript
export interface LoginResponse {
  success: boolean
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  token: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface InvestmentData {
  name: string
  email: string
  phone: string
  cpf?: string
  planId: string
  amount: number
  affiliateCode?: string
  utmSource?: string
  paymentMethod?: string
}

export interface MissionStep {
  email: string
  walletAddress: string
  step: "instagram" | "youtube" | "telegram"
  proof?: string
}
