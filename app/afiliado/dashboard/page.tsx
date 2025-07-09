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
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
} from "lucide-react"
import {
  getAffiliateStats,
  getAffiliateSales,
  getAffiliatePayments,
  getAffiliateProfile,
  type AffiliateStats,
  type AffiliateSale,
  type AffiliatePayment,
} from "@/lib/affiliate-dashboard"
import { formatCurrency, formatPercentage, getTierInfo } from "@/lib/affiliate-utils"

export default function DashboardAfiliado() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [affiliate, setAffiliate] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [sales, setSales] = useState<AffiliateSale[]>([])
  const [payments, setPayments] = useState<AffiliatePayment[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState("")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Verificar se usuário está logado
      const userData = localStorage.getItem("user")
      const affiliateData = localStorage.getItem("affiliate")

      if (!userData) {
        router.push("/afiliado/login")
        return
      }

      const parsedUser = JSON.parse(userData)
      const parsedAffiliate = affiliateData ? JSON.parse(affiliateData) : null

      setUser(parsedUser)
      setAffiliate(parsedAffiliate)

      console.log("👤 [DASHBOARD] Usuário logado:", parsedUser)
      console.log("🤝 [DASHBOARD] Dados do afiliado:", parsedAffiliate)

      if (parsedAffiliate?.id) {
        // Carregar dados do dashboard
        const [statsData, salesData, paymentsData, profileData] = await Promise.all([
          getAffiliateStats(parsedAffiliate.id),
          getAffiliateSales(parsedAffiliate.id, 5),
          getAffiliatePayments(parsedAffiliate.id, 5),
          getAffiliateProfile(parsedUser.id),
        ])

        setStats(statsData)
        setSales(salesData)
        setPayments(paymentsData)
        setProfile(profileData)

        console.log("📊 [DASHBOARD] Dados carregados:", { statsData, salesData, paymentsData, profileData })
      }
    } catch (error) {
      console.error("💥 [DASHBOARD] Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateLink = (page = "ofertas") => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://agroderi.com"
    return `${baseUrl}/rastreio?utm_id=${affiliate?.affiliate_code}&utm_source=affiliate&redirect=${page}`
  }

  const handleCopyLink = (page: string) => {
    const link = generateLink(page)
    navigator.clipboard.writeText(link)
    setCopiedLink(page)
    setTimeout(() => setCopiedLink(""), 2000)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("affiliate")
    localStorage.removeItem("token")
    router.push("/afiliado/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const tierInfo = getTierInfo(profile?.tier || "bronze")

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-zinc-800">Dashboard do Afiliado</h1>
              <p className="text-zinc-600">
                Olá, {user.name} • Código: {affiliate?.affiliate_code || profile?.affiliate_code}
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
              <Badge variant="outline" className={`border-2 ${tierInfo.color} ${tierInfo.bgColor}`}>
                {tierInfo.name} • {formatPercentage(tierInfo.rate * 100)}
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
                  <p className="text-xs text-zinc-600">Vendas Totais</p>
                  <p className="text-xl font-bold">{stats?.totalSales || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-xs text-zinc-600">Comissão Total</p>
                  <p className="text-xl font-bold">{formatCurrency(stats?.totalCommission || 0)}</p>
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
                  <p className="text-xl font-bold">{stats?.totalClicks || 0}</p>
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
                  <p className="text-xl font-bold">{formatPercentage(stats?.conversionRate || 0)}</p>
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
                  <p className="text-xl font-bold">{formatCurrency(stats?.pendingCommission || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="links">Meus Links</TabsTrigger>
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            <TabsTrigger value="materiais">Materiais</TabsTrigger>
          </TabsList>

          {/* Perfil Tab */}
          <TabsContent value="perfil" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Dados Pessoais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-600">Nome</p>
                      <p className="font-semibold">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-600">Email</p>
                      <p className="font-semibold">{user.email}</p>
                    </div>
                  </div>

                  {profile?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-zinc-500" />
                      <div>
                        <p className="text-sm text-zinc-600">Telefone</p>
                        <p className="font-semibold">{profile.phone}</p>
                      </div>
                    </div>
                  )}

                  {profile?.cpf && (
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-4 h-4 text-zinc-500" />
                      <div>
                        <p className="text-sm text-zinc-600">CPF</p>
                        <p className="font-semibold">{profile.cpf}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-600">Membro desde</p>
                      <p className="font-semibold">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR") : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas do Mês */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Métricas do Mês</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600">Vendas este mês</span>
                    <span className="font-bold text-green-600">{stats?.currentMonthSales || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600">Comissão este mês</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(stats?.currentMonthCommission || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600">Taxa de comissão</span>
                    <span className="font-bold text-purple-600">{formatPercentage(tierInfo.rate * 100)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600">Nível atual</span>
                    <Badge className={`${tierInfo.color} ${tierInfo.bgColor}`}>{tierInfo.name}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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

          {/* Vendas Tab */}
          <TabsContent value="vendas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                {sales.length > 0 ? (
                  <div className="space-y-3">
                    {sales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{sale.customerName}</p>
                          <p className="text-sm text-zinc-600">
                            {sale.date} • {sale.product}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(sale.saleValue)}</p>
                          <p className="text-sm text-green-600">Comissão: {formatCurrency(sale.commission)}</p>
                        </div>
                        <Badge variant={sale.status === "paid" ? "default" : "secondary"}>
                          {sale.status === "paid" ? "Pago" : sale.status === "pending" ? "Pendente" : "Cancelado"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-600">Nenhuma venda registrada ainda.</p>
                    <p className="text-sm text-zinc-500 mt-2">Comece a divulgar seus links para gerar vendas!</p>
                  </div>
                )}
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
                {payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-zinc-600">
                            {payment.date} • Ref: {payment.reference}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{payment.method}</p>
                          <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                            {payment.status === "paid"
                              ? "Pago"
                              : payment.status === "pending"
                                ? "Pendente"
                                : "Processando"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-600">Nenhum pagamento registrado ainda.</p>
                    <p className="text-sm text-zinc-500 mt-2">Os pagamentos são processados semanalmente.</p>
                  </div>
                )}

                {stats?.pendingCommission && stats.pendingCommission > 0 && (
                  <Alert className="mt-4">
                    <DollarSign className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Próximo pagamento:</strong> {formatCurrency(stats.pendingCommission)} pendente para
                      processamento
                    </AlertDescription>
                  </Alert>
                )}
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
        </Tabs>
      </main>
    </div>
  )
}
