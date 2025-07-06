"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadsTable } from "./leads-table"
import { VideosTable } from "./videos-table"
import { VideoUploadForm } from "./video-upload-form"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

interface DashboardClientProps {
  initialVideos: any[]
  initialLeads: any[]
  userEmail?: string
}

function SignOut({ userEmail }: { userEmail?: string }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="text-right">
      <p className="text-sm text-gray-400 mb-2 truncate">Logado como {userEmail}</p>
      <Button onClick={handleSignOut} variant="outline" className="bg-transparent border-gray-600 hover:bg-gray-700">
        Sair
      </Button>
    </div>
  )
}

export function DashboardClient({ initialVideos, initialLeads, userEmail }: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Gerenciamento</h1>
            <p className="text-gray-400 mt-1">Gerencie vídeos e acesse a lista de inscritos do funil.</p>
          </div>
          <SignOut userEmail={userEmail} />
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/60 border-gray-700">
            <TabsTrigger value="videos">Vídeos ({initialVideos.length})</TabsTrigger>
            <TabsTrigger value="leads">Inscritos ({initialLeads.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Adicionar ou Atualizar Vídeo</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Para atualizar um vídeo, basta enviar um novo para a mesma etapa e idioma. O vídeo antigo será
                  substituído.
                </p>
                <VideoUploadForm />
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Vídeos Atuais</h2>
                <VideosTable videos={initialVideos} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <LeadsTable leads={initialLeads} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
