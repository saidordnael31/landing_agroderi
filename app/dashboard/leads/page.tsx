import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { LeadsTable } from "../leads-table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function LeadsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: leads } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Inscritos no Funil ({leads?.length || 0})</h2>
          <p className="text-gray-400 text-sm mt-1">
            Lista de todos os usuários que se inscreveram no funil de vendas.
          </p>
        </div>
        <Button asChild variant="outline" className="bg-green-600 hover:bg-green-700 border-green-600">
          <Link href="/api/export-leads" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Link>
        </Button>
      </div>
      <LeadsTable leads={leads || []} />
    </div>
  )
}
