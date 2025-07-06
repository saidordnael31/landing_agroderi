"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"
import { deleteVideo } from "./actions"

interface Video {
  id: string
  step: number
  language: string
  video_url: string
}

interface VideosTableProps {
  videos: Video[]
}

function DeleteButton({ videoId }: { videoId: string }) {
  const { toast } = useToast()

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.")) {
      const result = await deleteVideo(videoId)
      toast({
        title: result.error ? "Erro" : "Sucesso",
        description: result.message,
        variant: result.error ? "destructive" : "default",
      })
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-500 hover:text-red-400">
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Excluir</span>
    </Button>
  )
}

export function VideosTable({ videos }: VideosTableProps) {
  const stepLabels: { [key: number]: string } = {
    0: "Etapa 0 (Nome)",
    1: "Etapa 1 (Email)",
    2: "Etapa 2 (Perfil)",
  }

  return (
    <div className="rounded-md border border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-700/50">
            <TableHead className="text-white">Etapa</TableHead>
            <TableHead className="text-white">Idioma</TableHead>
            <TableHead className="text-white">URL do Vídeo</TableHead>
            <TableHead className="text-right text-white">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos && videos.length > 0 ? (
            videos.map((video) => (
              <TableRow key={video.id} className="border-gray-700 hover:bg-gray-700/50">
                <TableCell className="font-medium">{stepLabels[video.step] || `Etapa ${video.step}`}</TableCell>
                <TableCell>{video.language.toUpperCase()}</TableCell>
                <TableCell>
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-400 hover:underline break-all"
                  >
                    {video.video_url}
                  </a>
                </TableCell>
                <TableCell className="text-right">
                  <DeleteButton videoId={video.id} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Nenhum vídeo cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
