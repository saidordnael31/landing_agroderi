import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  total_sales: number
  total_commission: number
  status: "active" | "pending" | "blocked"
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
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
}
