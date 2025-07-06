import type React from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DashboardNav } from "./dashboard-nav"

async function SignOut() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const handleSignOut = async () => {
    "use server"
    const supabase = createServerComponentClient({ cookies })
    await supabase.auth.signOut()
    return redirect("/login")
  }

  return (
    <form action={handleSignOut} className="text-right">
      <p className="text-sm text-gray-400 mb-2 truncate">Logado como {session?.user.email}</p>
      <Button type="submit" variant="outline" className="bg-transparent border-gray-600 hover:bg-gray-700">
        Sair
      </Button>
    </form>
  )
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Gerenciamento</h1>
            <p className="text-gray-400 mt-1">Gerencie vídeos e acesse a lista de inscritos do funil.</p>
          </div>
          <SignOut />
        </div>
        <DashboardNav />
        <main className="mt-6">{children}</main>
      </div>
    </div>
  )
}
