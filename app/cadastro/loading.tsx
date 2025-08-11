import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-zinc-50 to-green-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
        <p className="text-lg text-zinc-700">Carregando página de cadastro...</p>
      </div>
    </div>
  )
}
