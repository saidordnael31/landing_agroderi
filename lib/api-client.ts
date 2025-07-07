// Cliente para fazer chamadas para as APIs

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("auth_token")

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${this.baseUrl}/api${endpoint}`, config)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Erro na requisição")
    }

    return response.json()
  }

  // Autenticação
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  // Afiliados
  async registerAffiliate(data: any) {
    return this.request("/affiliates/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Investimentos
  async createInvestment(data: any) {
    return this.request("/investments/create", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Missões
  async submitMission(data: any) {
    return this.request("/missions/submit", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Dashboard Admin
  async getAdminDashboard() {
    return this.request("/admin/dashboard")
  }
}

export const apiClient = new ApiClient()
