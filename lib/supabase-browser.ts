import { createClient } from "@supabase/supabase-js"

// Verificar se as variáveis de ambiente estão disponíveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Variáveis de ambiente do Supabase não configuradas")
}

// Cliente público do Supabase (para uso no navegador)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para verificar a conexão
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)
    return { success: !error, error }
  } catch (error) {
    return { success: false, error }
  }
}
