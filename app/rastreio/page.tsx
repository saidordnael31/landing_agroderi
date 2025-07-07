"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Users, TrendingUp } from "lucide-react"
import { setAffiliateId, getAffiliateStats, isValidAffiliateId, getAffiliateBonus } from "@/lib/affiliate-utils"

export default function RastreioAfiliado() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [affiliateInfo, setAffiliateInfo] = useState(null)

  useEffect(() => {
    const utm_id = searchParams.get("utm_id")
    const ref = searchParams.get("ref")
    const redirect = searchParams.get("redirect") || "ofertas"
    const affiliateId = utm_id || ref

    if (affiliateId) {
      // Valida o ID do afiliado
      if (!isValidAffiliateId(affiliateId)) {
        console.warn("ID de afiliado inválido:", affiliateId)
        router.replace(`/${redirect}`)
        return
      }

      setIsRedirecting(true)

      // Usa a função utilitária para definir o ID
      setAffiliateId(affiliateId)

      // Busca informações do afiliado
      const stats = getAffiliateStats(affiliateId)
      setAffiliateInfo({
        id: affiliateId,
        name: `Afiliado ${affiliateId}`,
        bonus: `${getAffiliateBonus(affiliateId, "plano2")}% extra`,
        tier: stats.tier,
        totalReferrals: stats.totalReferrals,
      })

      // Track do evento
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "affiliate_tracking", {
          affiliate_id: affiliateId,
          affiliate_tier: stats.tier,
          page_location: window.location.href,
        })
      }

      // Redireciona com delay para melhor UX
      setTimeout(() => {
        router.replace(`/${redirect}?utm_id=${affiliateId}&ref=affiliate`)
      }, 2500)
    } else {
      // Sem ID de afiliado
      setTimeout(() => {
        router.replace(`/${redirect}`)
      }, 1000)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>

          <h1 className="text-2xl font-bold text-zinc-800 mb-4">Processando seu acesso...</h1>

          {affiliateInfo ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Indicação Especial</span>
                </div>
                <p className="text-sm text-green-700">Você foi indicado por: {affiliateInfo.name}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Bônus Exclusivo</span>
                </div>
                <p className="text-sm text-blue-700">Você receberá {affiliateInfo.bonus} de bônus adicional!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-zinc-600">Redirecionando para as melhores ofertas...</p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          )}

          <div className="mt-6 text-xs text-zinc-500">
            <p>Aguarde alguns segundos...</p>
            {affiliateInfo && <p className="mt-1">ID: {affiliateInfo.id}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
