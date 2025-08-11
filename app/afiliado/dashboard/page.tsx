"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  DollarSign,
  TrendingUp,
  Copy,
  Share2,
  BarChart3,
  Calendar,
  MousePointer,
  ShoppingCart,
  Loader2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react"
import { getCurrentUser, logoutUser } from "@/lib/supabase-auth"
import Link from "next/link"

interface DashboardData {
  affiliate: {
    id: string
    affiliate_code: string
    tier: string
    status: string
    total_sales: number
    total_commission: number
    commission_rate: number
    total_clicks: number
  }
  stats: {
    total_referrals: number
    pending_commission: number
    paid_commission: number
    conversion_rate: number
    this_month_sales: number
    this_month_commission: number
  }
  recent_sales: Array<{
    id: string
    amount: number
    commission: number
    status: string
    created_at: string
    customer_name?: string
  }>
  links: Array<{
    id: string
    url: string
    clicks: number
    conversions: number
    created_at: string
  }>
}

export default function AffiliateDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [copySuccess, setCopySuccess] = useState("")

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== "affiliate") {
      router.push("/afiliado/login")
      return
    }
    setUser(currentUser)
    loadDashboardData()
  }, [router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/affiliates/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erro ao carregar dados")
      }

      const data = await response.json()
      if (data.success) {
        setDashboardData(data.data)
      } else {
        setError(data.error || "Erro ao carregar dados")
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
      setError("Erro ao carregar dados do dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const copyAffiliateLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess("Link copiado!")
      setTimeout(() => setCopySuccess(""), 3000)
    } catch (error) {
      console.error("Erro ao copiar link:", error)
    }
  }

  const shareLink = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AGD Token - Oportunidade de Investimento",
          text: "Conheça o AGD Token e revolucione seus investimentos no agronegócio!",
          url: url,
        })
      } catch (error) {
        console.error("Erro ao compartilhar:", error)
      }
    } else {
      copyAffiliateLink(url)
    }
  }

  const handleLogout = () => {
    logoutUser()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
              <p className="text-zinc-600">Carregando dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
              <h2 className="text-xl font-bold text-red-800">Erro</h2>
              <p className="text-zinc-600">{error}</p>
              <div className="flex gap-2">
                <Button onClick={loadDashboardData} variant="outline" className="flex-1 bg-transparent">
                  Tentar Novamente
                </Button>
                <Button onClick={handleLogout} variant="destructive" className="flex-1">
                  Sair
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto" />
              <h2 className="text-xl font-bold text-yellow-800">Dados não encontrados</h2>
              <p className="text-zinc-600">Não foi possível carregar os dados do dashboard</p>
              <Button onClick={loadDashboardData} className="w-full">
                Recarregar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const affiliateLink = `${window.location.origin}/ofertas?ref=${dashboardData.affiliate.affiliate_code}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-green-800">Dashboard do Afiliado</h1>
              <p className="text-zinc-600">Bem-vindo, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={dashboardData.affiliate.status === "active" ? "default" : "secondary"}>
                {dashboardData.affiliate.tier.toUpperCase()}
              </Badge>
              <Button onClick={handleLogout} variant="outline">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {dashboardData.affiliate.total_sales.toLocaleString("pt-BR")}</div>
              <p className="text-xs text-muted-foreground">
                Este mês: R$ {dashboardData.stats.this_month_sales.toLocaleString("pt-BR")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissões</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {dashboardData.affiliate.total_commission.toLocaleString("pt-BR")}
              </div>
              <p className="text-xs text-muted-foreground">
                Pendente: R$ {dashboardData.stats.pending_commission.toLocaleString("pt-BR")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referidos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.total_referrals}</div>
              <p className="text-xs text-muted-foreground">
                Taxa de conversão: {dashboardData.stats.conversion_rate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cliques</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.affiliate.total_clicks}</div>
              <p className="text-xs text-muted-foreground">Taxa: {dashboardData.affiliate.commission_rate * 100}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Copy Success Alert */}
        {copySuccess && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{copySuccess}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="links">Meus Links</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Affiliate Link Card */}
            <Card>
              <CardHeader>
                <CardTitle>Seu Link de Afiliado</CardTitle>
                <p className="text-sm text-muted-foreground">Compartilhe este link para ganhar comissões</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg">
                  <code className="flex-1 text-sm">{affiliateLink}</code>
                  <Button size="sm" onClick={() => copyAffiliateLink(affiliateLink)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => shareLink(affiliateLink)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={affiliateLink} target="_blank">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Testar Link
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recent_sales.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recent_sales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                        <div>
                          <p className="font-medium">R$ {sale.amount.toLocaleString("pt-BR")}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">+R$ {sale.commission.toLocaleString("pt-BR")}</p>
                          <Badge variant={sale.status === "paid" ? "default" : "secondary"}>{sale.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma venda ainda</p>
                    <p className="text-sm text-muted-foreground">
                      Compartilhe seu link para começar a ganhar comissões
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance dos Links</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.links.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.links.map((link) => (
                      <div key={link.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-sm bg-zinc-100 px-2 py-1 rounded">{link.url}</code>
                          <Button size="sm" variant="outline" onClick={() => copyAffiliateLink(link.url)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Cliques</p>
                            <p className="font-medium">{link.clicks}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Conversões</p>
                            <p className="font-medium">{link.conversions}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Taxa</p>
                            <p className="font-medium">
                              {link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : 0}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum dado de performance ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recent_sales.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recent_sales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Venda #{sale.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.created_at).toLocaleDateString("pt-BR")} às{" "}
                            {new Date(sale.created_at).toLocaleTimeString("pt-BR")}
                          </p>
                          {sale.customer_name && (
                            <p className="text-sm text-muted-foreground">Cliente: {sale.customer_name}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R$ {sale.amount.toLocaleString("pt-BR")}</p>
                          <p className="text-sm text-green-600">
                            Comissão: R$ {sale.commission.toLocaleString("pt-BR")}
                          </p>
                          <Badge variant={sale.status === "paid" ? "default" : "secondary"}>
                            {sale.status === "paid" ? "Pago" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma venda registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Materiais de Marketing</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Baixe banners, textos e outros materiais para promover o AGD Token
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Banners</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Banners em diferentes tamanhos para suas redes sociais
                    </p>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Textos Prontos</h3>
                    <p className="text-sm text-muted-foreground mb-3">Textos otimizados para posts e campanhas</p>
                    <Button variant="outline" size="sm">
                      Visualizar
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Vídeos</h3>
                    <p className="text-sm text-muted-foreground mb-3">Vídeos explicativos sobre o AGD Token</p>
                    <Button variant="outline" size="sm">
                      Acessar
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Apresentação</h3>
                    <p className="text-sm text-muted-foreground mb-3">Slides para apresentações e webinars</p>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
