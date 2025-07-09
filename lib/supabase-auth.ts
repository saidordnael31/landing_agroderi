"use client"

import { supabase } from "./supabase-browser"
import bcrypt from "bcryptjs"
import { generateAffiliateCode } from "./affiliate-utils"

export interface RegisterAffiliateData {
  nome: string
  email: string
  telefone: string
  cpf?: string
  experiencia?: string
  canais: string[]
  motivacao?: string
  senha: string
}

export interface LoginData {
  email: string
  senha: string
}

export interface AuthResponse {
  success: boolean
  error?: string
  code?: string
  data?: any
}

export async function registerAffiliate(data: RegisterAffiliateData): Promise<AuthResponse> {
  try {
    console.log("🚀 [SUPABASE-AUTH] Iniciando cadastro para:", data.email)

    // 1. Validações básicas
    if (!data.nome || !data.email || !data.telefone || !data.senha) {
      return {
        success: false,
        error: "Campos obrigatórios não preenchidos",
        code: "MISSING_FIELDS",
      }
    }

    if (!data.email.includes("@")) {
      return {
        success: false,
        error: "Email inválido",
        code: "INVALID_EMAIL",
      }
    }

    // 2. Verificar se email já existe
    console.log("🔍 [SUPABASE-AUTH] Verificando email existente...")
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", data.email.toLowerCase())
      .single()

    if (existingUser && !checkError) {
      console.log("❌ [SUPABASE-AUTH] Email já existe:", data.email)
      return {
        success: false,
        error: "Este email já está cadastrado",
        code: "EMAIL_EXISTS",
      }
    }

    // 3. Hash da senha
    console.log("🔐 [SUPABASE-AUTH] Gerando hash da senha...")
    const passwordHash = await bcrypt.hash(data.senha, 12)

    // 4. Gerar código do afiliado
    const affiliateCode = generateAffiliateCode(data.nome)
    console.log("🔢 [SUPABASE-AUTH] Código gerado:", affiliateCode)

    // 5. Criar usuário primeiro
    console.log("👤 [SUPABASE-AUTH] Criando usuário...")
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        name: data.nome,
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        role: "affiliate",
        status: "active",
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (userError || !newUser) {
      console.error("❌ [SUPABASE-AUTH] Erro ao criar usuário:", userError)
      return {
        success: false,
        error: "Erro ao criar usuário",
        code: "USER_ERROR",
        data: userError,
      }
    }

    console.log("✅ [SUPABASE-AUTH] Usuário criado:", newUser.id)

    // 6. Criar registro de afiliado
    console.log("🤝 [SUPABASE-AUTH] Criando afiliado...")
    const { data: newAffiliate, error: affiliateError } = await supabase
      .from("affiliates")
      .insert({
        user_id: newUser.id,
        affiliate_code: affiliateCode,
        phone: data.telefone,
        cpf: data.cpf || null,
        experience: data.experiencia || null,
        channels: data.canais || [],
        motivation: data.motivacao || null,
        tier: "bronze",
        status: "active",
        total_sales: 0,
        total_commission: 0,
        commission_rate: 0.05, // 5% para bronze
        created_at: new Date().toISOString(),
      })
      .select("id, affiliate_code")
      .single()

    if (affiliateError || !newAffiliate) {
      console.error("❌ [SUPABASE-AUTH] Erro ao criar afiliado:", affiliateError)

      // Rollback - deletar usuário criado
      await supabase.from("users").delete().eq("id", newUser.id)

      return {
        success: false,
        error: "Erro ao criar registro de afiliado",
        code: "AFFILIATE_ERROR",
        data: affiliateError,
      }
    }

    console.log("✅ [SUPABASE-AUTH] Afiliado criado:", newAffiliate.affiliate_code)

    return {
      success: true,
      data: {
        user: {
          id: newUser.id,
          name: data.nome,
          email: data.email.toLowerCase(),
          role: "affiliate",
        },
        affiliate: {
          id: newAffiliate.id,
          affiliate_code: newAffiliate.affiliate_code,
          tier: "bronze",
          status: "active",
        },
      },
    }
  } catch (error) {
    console.error("💥 [SUPABASE-AUTH] Erro no cadastro:", error)
    return {
      success: false,
      error: "Erro interno no cadastro",
      code: "INTERNAL_ERROR",
      data: error,
    }
  }
}

export async function loginUser(data: LoginData): Promise<AuthResponse> {
  try {
    console.log("🔐 [SUPABASE-AUTH] Iniciando login para:", data.email)

    // 1. Validações
    if (!data.email || !data.senha) {
      return {
        success: false,
        error: "Email e senha são obrigatórios",
        code: "MISSING_CREDENTIALS",
      }
    }

    if (!data.email.includes("@")) {
      return {
        success: false,
        error: "Email inválido",
        code: "INVALID_EMAIL",
      }
    }

    // 2. Buscar usuário
    console.log("🔍 [SUPABASE-AUTH] Buscando usuário...")
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, email, password_hash, role, status")
      .eq("email", data.email.toLowerCase())
      .single()

    if (userError || !user) {
      console.log("❌ [SUPABASE-AUTH] Usuário não encontrado:", data.email)
      return {
        success: false,
        error: "Email ou senha incorretos",
        code: "INVALID_CREDENTIALS",
      }
    }

    console.log("✅ [SUPABASE-AUTH] Usuário encontrado:", user.email)

    // 3. Verificar status
    if (user.status !== "active") {
      return {
        success: false,
        error: "Conta inativa",
        code: "INACTIVE_ACCOUNT",
      }
    }

    // 4. Verificar senha
    console.log("🔐 [SUPABASE-AUTH] Verificando senha...")
    const passwordValid = await bcrypt.compare(data.senha, user.password_hash)

    if (!passwordValid) {
      console.log("❌ [SUPABASE-AUTH] Senha incorreta")
      return {
        success: false,
        error: "Email ou senha incorretos",
        code: "INVALID_CREDENTIALS",
      }
    }

    console.log("✅ [SUPABASE-AUTH] Senha válida")

    // 5. Buscar dados do afiliado se for afiliado
    let affiliateData = null
    if (user.role === "affiliate") {
      console.log("🤝 [SUPABASE-AUTH] Buscando dados do afiliado...")
      const { data: affiliate, error: affiliateError } = await supabase
        .from("affiliates")
        .select("id, affiliate_code, tier, status, total_sales, total_commission")
        .eq("user_id", user.id)
        .single()

      if (!affiliateError && affiliate) {
        affiliateData = affiliate
        console.log("✅ [SUPABASE-AUTH] Dados do afiliado carregados:", affiliate.affiliate_code)
      }
    }

    console.log("🎉 [SUPABASE-AUTH] Login realizado com sucesso!")

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        affiliate: affiliateData,
      },
    }
  } catch (error) {
    console.error("💥 [SUPABASE-AUTH] Erro no login:", error)
    return {
      success: false,
      error: "Erro interno no login",
      code: "INTERNAL_ERROR",
      data: error,
    }
  }
}

// Função para verificar se o usuário está logado
export function getCurrentUser() {
  if (typeof window === "undefined") return null

  try {
    const userData = localStorage.getItem("user")
    return userData ? JSON.parse(userData) : null
  } catch {
    return null
  }
}

// Função para fazer logout
export function logoutUser() {
  if (typeof window === "undefined") return

  localStorage.removeItem("user")
  localStorage.removeItem("affiliate")
  localStorage.removeItem("token")
}
