import { createClient } from "@supabase/supabase-js"

// URLs e chaves do Supabase (vem das variáveis de ambiente)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente público do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente servidor (com service role key)
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Tipos do banco de dados
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  cpf?: string
  role: "admin" | "viewer" | "buyer" | "affiliate"
  status: "active" | "pending" | "blocked"
  created_at: string
  updated_at: string
}

export interface Affiliate {
  id: string
  user_id: string
  affiliate_code: string
  tier: "standard" | "premium"
  experience?: string
  channels: string[]
  motivation?: string
  total_sales: number
  total_commission: number
  commission_rate: number
  status: "active" | "pending" | "blocked"
  created_at: string
  updated_at: string
  users?: User
}

export interface Investment {
  id: string
  user_id: string
  plan_id: string
  amount: number
  bonus: number
  affiliate_bonus: number
  affiliate_id?: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  purchase_date: string
  unlock_date: string
  withdrawal_requested: boolean
  withdrawal_date?: string
  payment_method: string
  transaction_id?: string
  utm_source?: string
  utm_campaign?: string
  created_at: string
  updated_at: string
  users?: User
  affiliates?: Affiliate
}

export interface Commission {
  id: string
  affiliate_id: string
  investment_id: string
  amount: number
  percentage: number
  status: "pending" | "paid" | "cancelled"
  generated_at: string
  paid_at?: string
  payment_method?: string
  created_at: string
  updated_at: string
  affiliates?: Affiliate
  investments?: Investment
}

export interface Mission {
  id: string
  user_email: string
  wallet_address: string
  steps_completed: any[]
  status: "pending" | "completed" | "paid"
  reward_amount: number
  instagram_verified: boolean
  youtube_verified: boolean
  telegram_verified: boolean
  created_at: string
  updated_at: string
}

export interface EventLog {
  id: string
  user_id?: string
  event_name: string
  event_data?: any
  ip_address?: string
  user_agent?: string
  created_at: string
}

// Funções utilitárias
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase.from("users").select("*").eq("email", email.toLowerCase()).single()

  if (error) return null
  return data
}

export async function getAffiliateByCode(code: string): Promise<Affiliate | null> {
  const { data, error } = await supabase
    .from("affiliates")
    .select("*, users(*)")
    .eq("affiliate_code", code.toUpperCase())
    .single()

  if (error) return null
  return data
}

export async function createUser(userData: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        ...userData,
        email: userData.email?.toLowerCase(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar usuário:", error)
    return null
  }
  return data
}

export async function createAffiliate(
  userId: string,
  tier: "standard" | "premium" = "standard",
): Promise<Affiliate | null> {
  // Gerar código único
  const { data: codeData, error: codeError } = await supabase.rpc("generate_affiliate_code")

  if (codeError) {
    console.error("Erro ao gerar código:", codeError)
    return null
  }

  const { data, error } = await supabase
    .from("affiliates")
    .insert([
      {
        user_id: userId,
        affiliate_code: codeData,
        tier,
        total_sales: 0,
        total_commission: 0,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select("*, users(*)")
    .single()

  if (error) {
    console.error("Erro ao criar afiliado:", error)
    return null
  }
  return data
}

export async function createInvestment(investmentData: Partial<Investment>): Promise<Investment | null> {
  const { data, error } = await supabase
    .from("investments")
    .insert([
      {
        ...investmentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select("*, users(*), affiliates(*)")
    .single()

  if (error) {
    console.error("Erro ao criar investimento:", error)
    return null
  }
  return data
}

export async function logEvent(eventData: Partial<EventLog>): Promise<void> {
  await supabase.from("event_logs").insert([
    {
      ...eventData,
      created_at: new Date().toISOString(),
    },
  ])
}
