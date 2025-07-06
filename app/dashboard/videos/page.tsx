import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { VideoUploadForm } from "../video-upload-form"
import { VideosTable } from "../videos-table"

export const dynamic = "force-dynamic"

export default async function VideosPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: videos } = await supabase.from("funnel_videos").select("*").order("step").order("language")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Adicionar ou Atualizar Vídeo</h2>
        <p className="text-sm text-gray-400 mb-4">
          Para atualizar um vídeo, basta enviar um novo para a mesma etapa e idioma. O vídeo antigo será substituído
          automaticamente.
        </p>
        <VideoUploadForm />
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Vídeos Atuais ({videos?.length || 0})</h2>
        <VideosTable videos={videos || []} />
      </div>
    </div>
  )
}
