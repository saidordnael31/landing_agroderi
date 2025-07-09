// Cliente para fazer requisições para as APIs
export class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro desconhecido" }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Afiliados
  async registerAffiliate(data: {
    nome: string
    email: string
    telefone: string
    cpf?: string
    experiencia?: string
    canais: string[]
    motivacao?: string
  }) {
    return this.request("/api/affiliates/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getAffiliate(code: string) {
    return this.request(`/api/affiliates/register?code=${code}`)
  }

  // Investimentos
  async createInvestment(data: {
    email: string
    nome: string
    telefone: string
    planId: string
    amount: number
    affiliateCode?: string
    utmSource?: string
    utmCampaign?: string
  }) {
    return this.request("/api/investments/create", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Missões
  async submitMission(data: {
    email: string
    walletAddress: string
    steps: any[]
  }) {
    return this.request("/api/missions/submit", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Dashboard Admin
  async getDashboardData() {
    return this.request("/api/admin/dashboard")
  }

  // Autenticação
  async login(email: string, password: string) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }
}

// Instância global do cliente
export const apiClient = new ApiClient()
