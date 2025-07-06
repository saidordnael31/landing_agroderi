import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardClient } from "./dashboard-client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: videos } = await supabase.from("funnel_videos").select("*").order("step").order("language")
  const { data: leads } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

  return <DashboardClient initialVideos={videos || []} initialLeads={leads || []} userEmail={session.user.email} />
}
