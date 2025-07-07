"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, TrendingUp, DollarSign, Share2, Copy, CheckCircle, BarChart3, Gift } from "lucide-react"
import { getAffiliateId, getAffiliateStats, generateAffiliateLink, clearAffiliateId } from "@/lib/affiliate-utils"

export default function AffiliateDashboard() {
  const router = useRouter()
  const [affiliateId, setAffiliateIdState] = useState("")
  const [stats, setStats] = useState(null)
  const [copiedLink, setCopiedLink] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const storedId = getAffiliateId()
    if (storedId) {
      setAffiliateIdState(storedId)
      setStats(getAffiliateStats(storedId))
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = () => {
    if (affiliateId.length >= 4) {
      setStats(getAffiliateStats(affiliateId))
      setIsLoggedIn(true)

      // Track login
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "affiliate_login", {
          affiliate_id: affiliateId,
        })
      }
    }
  }

  const handleCopyLink = (page) => {
    const link = generateAffiliateLink(affiliateId, page)
    navigator.clipboard.writeText(link)
    setCopiedLink(page)
    setTimeout(() => setCopiedLink(""), 2000)
  }

  const handleLogout = () => {
    clearAffiliateId()
    setIsLoggedIn(false)
    setAffiliateIdState("")
    setStats(null)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Dashboard do Afiliado</CardTitle>
            <p className="text-zinc-600">Acesse suas estatísticas e links</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">ID do Afiliado</label>
              <Input
                placeholder="Digite seu ID de afiliado"
                value={affiliateId}
                onChange={(e) => setAffiliateIdState(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full" disabled={affiliateId.length < 4}>
              Acessar Dashboard
            </Button>
            <div className="text-center">
              <Button variant="link" onClick={() => router.push("/")} className="text-sm">
                ← Voltar ao site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-zinc-800">Dashboard do Afiliado</h1>
              <p className="text-zinc-600">ID: {affiliateId}</p>
            </div>
            <div className="flex space-x-2">
              <Badge
                variant="outline"
                className={`${stats?.tier === "Premium" ? "border-purple-500 text-purple-700" : "border-blue-500 text-blue-700"}`}
              >
                {stats?.tier}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-zinc-600">Total de Indicações</p>
                  <p className="text-2xl font-bold">{stats?.totalReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-zinc-600">Ganhos Totais</p>
                  <p className="text-2xl font-bold">R$ {stats?.totalEarnings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-zinc-600">Taxa de Conversão</p>
                  <p className="text-2xl font-bold">{stats?.conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Gift className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-zinc-600">Bônus Atual</p>
                  <p className="text-2xl font-bold">Até 7.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links de Afiliado */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="w-5 h-5" />
              <span>Seus Links de Afiliado</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { page: "ofertas", title: "Página de Ofertas", desc: "Link principal para conversões" },
              { page: "missao", title: "Página de Missões", desc: "Para engajamento e tokens grátis" },
              { page: "", title: "Página Inicial", desc: "Landing page principal" },
            ].map((item) => (
              <div key={item.page} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-zinc-600">{item.desc}</p>
                  <code className="text-xs bg-white px-2 py-1 rounded mt-1 block">
                    {generateAffiliateLink(affiliateId, item.page)}
                  </code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(item.page)}
                  className="flex items-center space-x-1"
                >
                  {copiedLink === item.page ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dicas de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Dicas para Melhorar Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  <strong>Segmente seu público:</strong> Use diferentes links para diferentes audiências (redes sociais,
                  email, etc.)
                </AlertDescription>
              </Alert>

              <Alert>
                <Share2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Conte sua história:</strong> Compartilhe por que você acredita no AGD Token
                </AlertDescription>
              </Alert>

              <Alert>
                <Gift className="h-4 w-4" />
                <AlertDescription>
                  <strong>Destaque os bônus:</strong> Mencione que seus indicados recebem bônus exclusivos
                </AlertDescription>
              </Alert>

              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Acompanhe métricas:</strong> Monitore quais canais geram mais conversões
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
