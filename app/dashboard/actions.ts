"use server"

import { put } from "@vercel/blob"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function uploadVideo(prevState: any, formData: FormData) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { message: "Não autorizado.", error: true, timestamp: Date.now() }
  }

  const step = formData.get("step") as string
  const language = formData.get("language") as string
  const sourceType = formData.get("sourceType") as "upload" | "url"

  if (!step || !language || !sourceType) {
    return { message: "Campos de etapa, idioma e tipo de fonte são obrigatórios.", error: true, timestamp: Date.now() }
  }

  let videoUrl = ""

  try {
    if (sourceType === "upload") {
      const videoFile = formData.get("video") as File
      if (!videoFile || videoFile.size === 0) {
        return { message: "O arquivo de vídeo é obrigatório para upload.", error: true, timestamp: Date.now() }
      }
      const blob = await put(videoFile.name, videoFile, {
        access: "public",
      })
      videoUrl = blob.url
    } else {
      // sourceType === 'url'
      const urlFromForm = formData.get("videoUrl") as string
      if (!urlFromForm) {
        return { message: "A URL do vídeo é obrigatória.", error: true, timestamp: Date.now() }
      }
      // Validação simples de URL
      try {
        new URL(urlFromForm)
      } catch (_) {
        return { message: "A URL fornecida é inválida.", error: true, timestamp: Date.now() }
      }
      videoUrl = urlFromForm
    }

    // Salva a URL (do Blob ou do Drive) no Supabase
    const { error } = await supabase.from("funnel_videos").upsert(
      {
        step: Number.parseInt(step),
        language: language,
        video_url: videoUrl,
      },
      { onConflict: "step,language" },
    )

    if (error) {
      throw error
    }

    revalidatePath("/dashboard")
    revalidatePath("/") // Limpa o cache da página do funil (agora na raiz)
    return { message: "Vídeo salvo com sucesso!", error: false, timestamp: Date.now() }
  } catch (error: any) {
    console.error("Save Video Error:", error)
    return { message: `Erro ao salvar vídeo: ${error.message}`, error: true, timestamp: Date.now() }
  }
}
