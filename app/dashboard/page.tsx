import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { VideoUploadForm } from "./video-upload-form"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadsTable } from "./leads-table"

export const dynamic = "force-dynamic"

async function SignOut() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <form
      action={async () => {
        "use server"
        const supabase = createServerComponentClient({ cookies })
        await supabase.auth.signOut()
        redirect("/login")
      }}
      className="text-right"
    >
      <p className="text-sm text-gray-400 mb-2 truncate">Logado como {session?.user.email}</p>
      <Button type="submit" variant="outline" className="bg-transparent border-gray-600 hover:bg-gray-700">
        Sair
      </Button>
    </form>
  )
}

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

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/60 border-gray-700">
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="leads">Inscritos ({leads?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Adicionar ou Atualizar Vídeo</h2>
                <VideoUploadForm />
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Vídeos Atuais</h2>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {videos && videos.length > 0 ? (
                    videos.map((video) => (
                      <div key={video.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
                        <div>
                          <p className="font-semibold">
                            Etapa {video.step} - Idioma: {video.language.toUpperCase()}
                          </p>
                          <a
                            href={video.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-400 hover:underline break-all"
                          >
                            {video.video_url}
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Nenhum vídeo cadastrado.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <LeadsTable leads={leads || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
