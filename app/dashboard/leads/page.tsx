import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { LeadsTable } from "../leads-table"

export const dynamic = "force-dynamic"

export default async function LeadsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: leads } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Inscritos no Funil ({leads?.length || 0})</h2>
        <p className="text-gray-400 text-sm mt-1">Lista de todos os usuários que se inscreveram no funil de vendas.</p>
      </div>
      <LeadsTable leads={leads || []} />
    </div>
  )
}
