"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  DollarSign,
  TrendingUp,
  Share2,
  Copy,
  CheckCircle,
  BarChart3,
  Gift,
  Download,
  MessageCircle,
  Instagram,
  Facebook,
} from "lucide-react"

export default function DashboardAfiliado() {
  const router = useRouter()
  const [affiliateData, setAffiliateData] = useState(null)
  const [copiedLink, setCopiedLink] = useState("")
  const [stats, setStats] = useState({
    vendas: 12,
    comissao: 2450,
    cliques: 156,
    conversao: 7.7,
    pendente: 450,
  })

  useEffect(() => {
    const currentAffiliate = localStorage.getItem("current_affiliate")
    if (!currentAffiliate) {
      router.push("/afiliado/login")
      return
    }

    // Carrega dados do afiliado
    const data = localStorage.getItem(`affiliate_${currentAffiliate}`)
    if (data) {
      setAffiliateData(JSON.parse(data))
    } else {
      // Dados demo se não encontrar
      setAffiliateData({
        id: currentAffiliate,
        nome: "João Silva",
        email: "joao@email.com",
        status: "ativo",
        tier: "Premium",
      })
    }
  }, [router])

  const generateLink = (page = "ofertas") => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://agroderi.com"
    return `${baseUrl}/rastreio?utm_id=${affiliateData?.id}&utm_source=affiliate&redirect=${page}`
  }

  const handleCopyLink = (page) => {
    const link = generateLink(page)
    navigator.clipboard.writeText(link)
    setCopiedLink(page)
    setTimeout(() => setCopiedLink(""), 2000)
  }

  const handleLogout = () => {
    localStorage.removeItem("current_affiliate")
    router.push("/afiliado/login")
  }

  if (!affiliateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600">Carregando dashboard...</p>
        </div>
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
              <p className="text-zinc-600">
                Olá, {affiliateData.nome} • ID: {affiliateData.id}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/afiliado/materiais")}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Materiais
              </Button>
              <Badge
                variant="outline"
                className={`${affiliateData.tier === "Premium" ? "border-purple-500 text-purple-700" : "border-blue-500 text-blue-700"}`}
              >
                {affiliateData.tier || "Standard"}
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
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-xs text-zinc-600">Vendas</p>
                  <p className="text-xl font-bold">{stats.vendas}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-xs text-zinc-600">Comissão</p>
                  <p className="text-xl font-bold">R$ {stats.comissao}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-xs text-zinc-600">Cliques</p>
                  <p className="text-xl font-bold">{stats.cliques}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-xs text-zinc-600">Conversão</p>
                  <p className="text-xl font-bold">{stats.conversao}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Gift className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="text-xs text-zinc-600">Pendente</p>
                  <p className="text-xl font-bold">R$ {stats.pendente}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="links">Meus Links</TabsTrigger>
            <TabsTrigger value="materiais">Materiais</TabsTrigger>
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          </TabsList>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Share2 className="w-5 h-5" />
                  <span>Seus Links de Afiliado</span>
                </CardTitle>
                <p className="text-zinc-600">Use estes links para divulgar e ganhar comissões</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    page: "ofertas",
                    title: "🎯 Página de Ofertas",
                    desc: "Link principal - maior conversão",
                    color: "bg-green-50 border-green-200",
                  },
                  {
                    page: "missao",
                    title: "🎮 Página de Missões",
                    desc: "Para engajamento e tokens grátis",
                    color: "bg-blue-50 border-blue-200",
                  },
                  {
                    page: "",
                    title: "🏠 Página Inicial",
                    desc: "Landing page principal",
                    color: "bg-purple-50 border-purple-200",
                  },
                ].map((item) => (
                  <div key={item.page} className={`p-4 rounded-lg border ${item.color}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-zinc-600 mb-2">{item.desc}</p>
                        <code className="text-xs bg-white px-2 py-1 rounded border block break-all">
                          {generateLink(item.page)}
                        </code>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(item.page)}
                        className="ml-4 flex items-center space-x-1"
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
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dicas de Divulgação */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Dicas de Divulgação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Alert>
                    <Instagram className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Instagram:</strong> Poste stories com o link nos destaques. Use hashtags como
                      #investimentos #tokens #agd
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <MessageCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>WhatsApp:</strong> Compartilhe em grupos de investimentos. Explique os benefícios dos
                      tokens lastreados
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <Facebook className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Facebook:</strong> Publique em grupos de criptomoedas e investimentos. Foque na segurança
                      dos commodities
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Indicação Direta:</strong> Fale com amigos e familiares. Explique como funciona o lastro
                      em commodities
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materiais Tab */}
          <TabsContent value="materiais" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Materiais de Marketing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { nome: "Banner Instagram Stories", tipo: "PNG", tamanho: "1080x1920" },
                    { nome: "Banner Facebook Post", tipo: "JPG", tamanho: "1200x630" },
                    { nome: "Vídeo Explicativo", tipo: "MP4", tamanho: "30s" },
                    { nome: "Apresentação PowerPoint", tipo: "PPTX", tamanho: "15 slides" },
                    { nome: "E-book AGD Token", tipo: "PDF", tamanho: "20 páginas" },
                    { nome: "Scripts de Vendas", tipo: "PDF", tamanho: "5 páginas" },
                  ].map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold">{material.nome}</h3>
                        <p className="text-sm text-zinc-600">
                          {material.tipo} • {material.tamanho}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendas Tab */}
          <TabsContent value="vendas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { data: "2024-01-15", cliente: "Maria S.", valor: "R$ 1.500", comissao: "R$ 225", status: "Pago" },
                    { data: "2024-01-14", cliente: "João P.", valor: "R$ 500", comissao: "R$ 50", status: "Pago" },
                    {
                      data: "2024-01-13",
                      cliente: "Ana L.",
                      valor: "R$ 2.000",
                      comissao: "R$ 300",
                      status: "Pendente",
                    },
                    { data: "2024-01-12", cliente: "Carlos M.", valor: "R$ 800", comissao: "R$ 80", status: "Pago" },
                  ].map((venda, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{venda.cliente}</p>
                        <p className="text-sm text-zinc-600">{venda.data}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{venda.valor}</p>
                        <p className="text-sm text-green-600">Comissão: {venda.comissao}</p>
                      </div>
                      <Badge variant={venda.status === "Pago" ? "default" : "secondary"}>{venda.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pagamentos Tab */}
          <TabsContent value="pagamentos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { data: "2024-01-08", valor: "R$ 1.200", metodo: "PIX", status: "Pago" },
                    { data: "2024-01-01", valor: "R$ 850", metodo: "PIX", status: "Pago" },
                    { data: "2023-12-25", valor: "R$ 650", metodo: "PIX", status: "Pago" },
                  ].map((pagamento, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{pagamento.valor}</p>
                        <p className="text-sm text-zinc-600">{pagamento.data}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{pagamento.metodo}</p>
                        <Badge variant="default">{pagamento.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <Alert className="mt-4">
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Próximo pagamento:</strong> Segunda-feira, 22/01/2024 • R$ 450,00 pendente
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
