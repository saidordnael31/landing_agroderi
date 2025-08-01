"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { trackAffiliateClick } from "@/lib/affiliate-dashboard"

export default function RastreioPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("Processando...")

  useEffect(() => {
    const processTracking = async () => {
      try {
        // Obter parâmetros da URL
        const utmId = searchParams.get("utm_id") // Código do afiliado
        const utmSource = searchParams.get("utm_source")
        const redirect = searchParams.get("redirect") || "ofertas"

        console.log("🔗 [RASTREIO] Parâmetros recebidos:", {
          utmId,
          utmSource,
          redirect,
        })

        if (utmId && utmSource === "affiliate") {
          setStatus("Registrando visita...")

          // Registrar clique no banco de dados
          const success = await trackAffiliateClick(utmId, redirect)

          if (success) {
            console.log("✅ [RASTREIO] Clique registrado com sucesso")
            setStatus("Redirecionando...")

            // Salvar dados de tracking no localStorage
            const trackingData = {
              affiliateCode: utmId,
              source: utmSource,
              timestamp: new Date().toISOString(),
              destination: redirect,
            }

            localStorage.setItem("affiliate_tracking", JSON.stringify(trackingData))
            console.log("💾 [RASTREIO] Dados salvos no localStorage:", trackingData)
          } else {
            console.warn("⚠️ [RASTREIO] Falha ao registrar clique")
            setStatus("Erro no rastreamento, redirecionando...")
          }
        } else {
          console.log("ℹ️ [RASTREIO] Sem parâmetros de afiliado, redirecionando diretamente")
          setStatus("Redirecionando...")
        }

        // Aguardar um pouco para mostrar o status
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Redirecionar para a página de destino
        const destinationMap: { [key: string]: string } = {
          ofertas: "/ofertas",
          missao: "/missao",
          "": "/",
        }

        const destination = destinationMap[redirect] || "/ofertas"
        console.log("🎯 [RASTREIO] Redirecionando para:", destination)

        router.push(destination)
      } catch (error) {
        console.error("💥 [RASTREIO] Erro no processamento:", error)
        setStatus("Erro, redirecionando...")

        // Redirecionar mesmo com erro
        setTimeout(() => {
          router.push("/ofertas")
        }, 2000)
      }
    }

    processTracking()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-zinc-800 mb-2">Agroderi</h1>
        <p className="text-zinc-600 mb-4">{status}</p>
        <div className="text-sm text-zinc-500">Você será redirecionado automaticamente...</div>
      </div>
    </div>
  )
}
