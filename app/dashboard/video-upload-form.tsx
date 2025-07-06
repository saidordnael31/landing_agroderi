"use client"

import { useFormState, useFormStatus } from "react-dom"
import { uploadVideo } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useRef, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

const initialState = {
  message: "",
  error: false,
  timestamp: Date.now(),
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full bg-green-600 hover:bg-green-700 mt-4">
      {pending ? "Salvando..." : "Salvar Vídeo"}
    </Button>
  )
}

export function VideoUploadForm() {
  const [state, formAction] = useFormState(uploadVideo, initialState)
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [sourceType, setSourceType] = useState("upload")

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.error ? "Erro" : "Sucesso",
        description: state.message,
        variant: state.error ? "destructive" : "default",
      })
      if (!state.error) {
        formRef.current?.reset()
        setSourceType("upload") // Reset tab selection
      }
    }
  }, [state, toast])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="sourceType" value={sourceType} />
      <div className="space-y-2">
        <Label htmlFor="step">Etapa do Funil</Label>
        <Select name="step" required>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Selecione a etapa" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            <SelectItem value="0">Etapa 0 (Nome)</SelectItem>
            <SelectItem value="1">Etapa 1 (Email)</SelectItem>
            <SelectItem value="2">Etapa 2 (Perfil)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="language">Idioma</Label>
        <Select name="language" defaultValue="pt" required>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Selecione o idioma" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            <SelectItem value="pt">Português (pt)</SelectItem>
            <SelectItem value="en">Inglês (en)</SelectItem>
            <SelectItem value="es">Espanhol (es)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={sourceType} onValueChange={setSourceType} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-700">
          <TabsTrigger value="upload">Upload de Arquivo</TabsTrigger>
          <TabsTrigger value="url">Link Externo</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="pt-4">
          <Label htmlFor="video">Arquivo de Vídeo</Label>
          <Input
            id="video"
            name="video"
            type="file"
            accept="video/mp4,video/webm"
            required={sourceType === "upload"}
            className="text-gray-400 file:text-white file:bg-gray-600 file:border-0 file:px-3 file:py-1.5 file:rounded"
          />
        </TabsContent>
        <TabsContent value="url" className="pt-4">
          <Label htmlFor="videoUrl">URL do Vídeo (Google Drive)</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            type="url"
            placeholder="https://drive.google.com/uc?export=download&id=..."
            required={sourceType === "url"}
            className="bg-gray-700 border-gray-600 text-white"
          />
          <p className="text-xs text-gray-400 mt-2">
            Importante: Use o link de download direto do Google Drive, não o link de compartilhamento.
          </p>
        </TabsContent>
      </Tabs>

      <SubmitButton />
    </form>
  )
}
