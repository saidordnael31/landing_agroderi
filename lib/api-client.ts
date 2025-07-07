// Cliente para fazer chamadas para as APIs do backend

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_API_URL || ""
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("auth_token")
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken()

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // Autenticação
  async login(email: string, password: string): Promise<ApiResponse> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  // Afiliados
  async registerAffiliate(data: {
    email: string
    nome: string
    telefone: string
    cpf?: string
  }): Promise<ApiResponse> {
    return this.request("/affiliates/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Investimentos
  async createInvestment(data: {
    planId: string
    amount: number
    userEmail: string
    userName: string
    userPhone: string
    affiliateCode?: string
    paymentMethod?: string
  }): Promise<ApiResponse> {
    return this.request("/investments/create", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Missões
  async submitMission(data: {
    email: string
    wallet: string
    stepsCompleted: string[]
  }): Promise<ApiResponse> {
    return this.request("/missions/submit", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Dashboard Admin
  async getAdminDashboard(): Promise<ApiResponse> {
    return this.request("/admin/dashboard")
  }

  // Utilitários
  saveAuthToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  removeAuthToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }
}

export const apiClient = new ApiClient()

// Hook para usar o cliente da API
export function useApiClient() {
  return apiClient
}
