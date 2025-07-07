"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, ExternalLink } from "lucide-react"
import { deleteVideo } from "./actions"
import { useState } from "react"

interface Video {
  id: string
  step: number
  language: string
  video_url: string
}

interface VideosTableProps {
  videos: Video[]
}

export function VideosTable({ videos }: VideosTableProps) {
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const stepLabels: { [key: number]: string } = {
    0: "Etapa 0 (Nome)",
    1: "Etapa 1 (Email)",
    2: "Etapa 2 (Perfil)",
  }

  const languageLabels: { [key: string]: string } = {
    pt: "Português",
    en: "Inglês",
    es: "Espanhol",
    fr: "Francês",
    de: "Alemão",
    ru: "Russo",
    zh: "Chinês",
  }

  const handleDelete = async (videoId: string) => {
    if (!confirm("Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.")) {
      return
    }

    setDeletingId(videoId)
    try {
      const result = await deleteVideo(videoId)
      toast({
        title: result.error ? "Erro" : "Sucesso",
        description: result.message,
        variant: result.error ? "destructive" : "default",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir vídeo",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="rounded-md border border-gray-700 p-8 text-center">
        <p className="text-gray-400">Nenhum vídeo cadastrado ainda.</p>
        <p className="text-sm text-gray-500 mt-2">Use o formulário ao lado para adicionar seu primeiro vídeo.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-gray-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-700/50">
            <TableHead className="text-white">Etapa</TableHead>
            <TableHead className="text-white">Idioma</TableHead>
            <TableHead className="text-white">Vídeo</TableHead>
            <TableHead className="text-right text-white">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video) => (
            <TableRow key={video.id} className="border-gray-700 hover:bg-gray-700/50">
              <TableCell className="font-medium">{stepLabels[video.step] || `Etapa ${video.step}`}</TableCell>
              <TableCell>{languageLabels[video.language] || video.language.toUpperCase()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 hover:underline text-xs transition-colors"
                    onClick={(e) => {
                      // Verificar se a URL é válida antes de abrir
                      try {
                        new URL(video.video_url)
                      } catch {
                        e.preventDefault()
                        toast({
                          title: "Erro",
                          description: "URL do vídeo é inválida",
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Ver vídeo</span>
                  </a>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]" title={video.video_url}>
                    {video.video_url.length > 50 ? `${video.video_url.substring(0, 50)}...` : video.video_url}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(video.id)}
                  disabled={deletingId === video.id}
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Excluir vídeo</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
