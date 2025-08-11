"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Shield, TrendingUp, Users, CheckCircle, Star, Clock, DollarSign, Zap, Target, Gift, ArrowRight, Eye, Calendar, BarChart3, MousePointer, AlertTriangle, Megaphone, Coins, Plus } from 'lucide-react'
import { calculateExpectedTrafficResults, calculateMonthlyCommitment, calculateTokenValue } from "@/lib/business-rules"

// Dados dos vídeos reais do Vimeo
const videos = [
  {
    id: "1106579696",
    title: "AGD Token: Tokens + Tráfego Pago",
    description: "Descubra como receber tokens AGD E tráfego pago para seu link de afiliado",
    duration: "12:20",
    thumbnail:
      "https://sjc.microlink.io/gBxIItfrCFQ0h_l-cLrCed88O4QjSoT_w00YoNrdhg98srAFYizRZP0U2viUHpt92KVO2m6Qw1ErqmECoyc-Jg.jpeg",
    isMain: true,
  },
  {
    id: "1104233124",
    title: "Duplo Benefício: Tokens e Tráfego",
    description: "Entenda como você recebe tokens para investir E tráfego para gerar comissões",
    duration: "15:30",
    thumbnail:
      "https://sjc.microlink.io/fX37B9szc_xR64LjAJtjbcWvThr7_KIsEacAGso-6gzMoM9yP6a-21PDi0XCrgmGos8pk-Uvb6UoCccZ75fzVg.jpeg",
    isMain: false,
  },
  {
    id: "1104226648",
    title: "Resultados Reais: Tokens + Comissões",
    description: "Veja como nossos usuários estão acumulando tokens e gerando comissões",
    duration: "8:45",
    thumbnail:
      "https://sjc.microlink.io/fMSavLgXt0OrjsNYD1bUOJxVYUzCOT3i2hrUdI6RekBaxo4N-vimOVVGwrRMM_HI-FX9Kk236eZC3I6ujLLOug.jpeg",
    isMain: false,
  },
  {
    id: "1102008931",
    title: "Estratégias de Maximização",
    description: "Como otimizar tanto o crescimento dos tokens quanto as conversões do tráfego",
    duration: "10:15",
    thumbnail:
      "https://sjc.microlink.io/jedQSM9xbTj4DAW9xm8bEY3yTN5MI4piCzO7vKpRXMSCQdDVx3ifWeVLDjeWiioCJv2p386c9TcI_pw5FY4V_Q.jpeg",
    isMain: false,
  },
]

export default function OfertasPage() {
  const searchParams = useSearchParams()
  const [currentVideo, setCurrentVideo] = useState(videos[0])
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState("professional")

  useEffect(() => {
    // Capturar código de afiliado da URL
    const utmId = searchParams.get("utm_id")
    const ref = searchParams.get("ref")
    const affiliate = utmId || ref

    if (affiliate) {
      setAffiliateCode(affiliate)
      console.log("🔗 [OFERTAS] Código de afiliado detectado:", affiliate)

      // Salvar no localStorage para uso posterior
      localStorage.setItem("affiliate_code", affiliate)

      // Registrar clique no link de afiliado
      fetch("/api/affiliates/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateCode: affiliate,
          page: "ofertas",
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      }).catch(console.error)
    }
  }, [searchParams])

  const handleVideoChange = (video: (typeof videos)[0]) => {
    setCurrentVideo(video)

    // Track video play event
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "video_play", {
        event_category: "engagement",
        event_label: video.title,
        video_id: video.id,
      })
    }
  }

  const handleSelectPlan = (packageType: string) => {
    try {
      console.log("📋 [PLAN_SELECTION] Plano selecionado:", { packageType, affiliateCode })

      // Criar URL para cadastro com plano pré-selecionado
      const params = new URLSearchParams({
        plan: packageType,
        type: "dual_commitment",
      })

      // Adicionar código de afiliado se existir
      if (affiliateCode) {
        params.set("affiliate", affiliateCode)
      }

      // Redirecionar para página de cadastro
      window.location.href = `/cadastro?${params.toString()}`
    } catch (error) {
      console.error("💥 [PLAN_SELECTION] Erro:", error)
      alert("Erro ao selecionar plano. Tente novamente.")
    }
  }

  const packages = [
    {
      id: "starter",
      name: "Starter",
      monthlyPrice: 1500,
      totalPrice: 6000,
      monthlyTokens: 1650, // 1500 + 10% bônus
      totalTokens: 6600,
      trafficBudget: 1500,
      totalTrafficBudget: 6000,
      bonus: "10% bônus",
      commission: "10%",
      features: [
        "R$ 1.500/mês por 4 meses",
        "1.650 AGD Tokens/mês (com 10% bônus)",
        "R$ 1.500/mês em tráfego pago",
        "~1.000 cliques/mês estimados",
        "~20 conversões/mês estimadas",
        "Dashboard completo",
        "Suporte técnico"
      ],
      popular: false,
      commitment: "4 meses mínimo",
      expectedResults: calculateExpectedTrafficResults(1500),
      commitmentDetails: calculateMonthlyCommitment("starter"),
      tokenProjection: calculateTokenValue(6600),
    },
    {
      id: "professional",
      name: "Professional",
      monthlyPrice: 3000,
      totalPrice: 12000,
      monthlyTokens: 3450, // 3000 + 15% bônus
      totalTokens: 13800,
      trafficBudget: 3000,
      totalTrafficBudget: 12000,
      bonus: "15% bônus",
      commission: "12%",
      features: [
        "R$ 3.000/mês por 4 meses",
        "3.450 AGD Tokens/mês (com 15% bônus)",
        "R$ 3.000/mês em tráfego pago",
        "~2.000 cliques/mês estimados",
        "~40 conversões/mês estimadas",
        "Campanhas otimizadas",
        "Suporte prioritário",
        "Relatórios avançados"
      ],
      popular: true,
      commitment: "4 meses mínimo",
      expectedResults: calculateExpectedTrafficResults(3000),
      commitmentDetails: calculateMonthlyCommitment("professional"),
      tokenProjection: calculateTokenValue(13800),
    },
    {
      id: "enterprise",
      name: "Enterprise",
      monthlyPrice: 5000,
      totalPrice: 20000,
      monthlyTokens: 6000, // 5000 + 20% bônus
      totalTokens: 24000,
      trafficBudget: 5000,
      totalTrafficBudget: 20000,
      bonus: "20% bônus",
      commission: "15%",
      features: [
        "R$ 5.000/mês por 4 meses",
        "6.000 AGD Tokens/mês (com 20% bônus)",
        "R$ 5.000/mês em tráfego pago",
        "~3.333 cliques/mês estimados",
        "~67 conversões/mês estimadas",
        "Campanhas premium",
        "Suporte VIP 24/7",
        "Consultoria estratégica",
        "Gerente dedicado"
      ],
      popular: false,
      commitment: "4 meses mínimo",
      expectedResults: calculateExpectedTrafficResults(5000),
      commitmentDetails: calculateMonthlyCommitment("enterprise"),
      tokenProjection: calculateTokenValue(24000),
    },
    {
      id: "elite",
      name: "Elite",
      monthlyPrice: 10000,
      totalPrice: 40000,
      monthlyTokens: 12500, // 10000 + 25% bônus
      totalTokens: 50000,
      trafficBudget: 10000,
      totalTrafficBudget: 40000,
      bonus: "25% bônus",
      commission: "20%",
      features: [
        "R$ 10.000/mês por 4 meses",
        "12.500 AGD Tokens/mês (com 25% bônus)",
        "R$ 10.000/mês em tráfego pago",
        "~6.667 cliques/mês estimados",
        "~133 conversões/mês estimadas",
        "Campanhas enterprise",
        "Otimização com IA",
        "Equipe dedicada exclusiva",
        "Consultoria diária"
      ],
      popular: false,
      commitment: "4 meses mínimo",
      expectedResults: calculateExpectedTrafficResults(10000),
      commitmentDetails: calculateMonthlyCommitment("elite"),
      tokenProjection: calculateTokenValue(50000),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src="/placeholder-logo.svg" alt="AGD Token" className="h-8 w-auto" />
              <h1 className="text-xl font-bold text-zinc-800">AGD Token</h1>
            </div>
            {affiliateCode && (
              <Badge variant="outline" className="border-green-600 text-green-600">
                Código: {affiliateCode}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-zinc-800 mb-6">
            Receba Tokens AGD
            <span className="text-green-600 block">+ Tráfego Pago</span>
          </h1>
          <p className="text-xl text-zinc-600 mb-8 max-w-3xl mx-auto">
            Invista mensalmente e receba tokens AGD para seu portfólio E tráfego pago direcionado para seu link de afiliado.
            Duplo benefício: acumule tokens + gere comissões!
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <Coins className="w-4 h-4 mr-2" />
              Tokens AGD + Bônus
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              <Megaphone className="w-4 h-4 mr-2" />
              Tráfego Pago Qualificado
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard Completo
            </Badge>
          </div>

          {/* Commitment Alert */}
          <Alert className="max-w-4xl mx-auto mb-8 border-green-200 bg-green-50">
            <Plus className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Duplo Benefício:</strong> Ao escolher um plano, você se compromete a investir o valor mensal por{" "}
              <strong>4 meses consecutivos</strong> e recebe TANTO tokens AGD (com bônus) para seu portfólio QUANTO
              tráfego pago direcionado para seu link de afiliado. É investimento + marketing em um só!
            </AlertDescription>
          </Alert>
        </div>

        {/* Video Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">
              Entenda o sistema de duplo benefício
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Video Player */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-video relative">
                  <iframe
                    src={`https://player.vimeo.com/video/${currentVideo.id}?autoplay=1&title=0&byline=0&portrait=0`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-zinc-800 mb-2">{currentVideo.title}</h3>
                  <p className="text-zinc-600 mb-4">{currentVideo.description}</p>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{currentVideo.duration}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>Exclusivo</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Playlist */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800">Playlist de Vídeos</h3>
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    currentVideo.id === video.id ? "ring-2 ring-green-500 bg-green-50" : ""
                  }`}
                  onClick={() => handleVideoChange(video)}
                >
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={video.thumbnail || "/placeholder.svg"}
                          alt={video.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white drop-shadow-lg" />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-zinc-800 line-clamp-2 mb-1">{video.title}</h4>
                        <p className="text-xs text-zinc-600 line-clamp-2">{video.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Investment Packages */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">Escolha Seu Plano de Duplo Benefício</h2>
            <p className="text-xl text-zinc-600">
              Receba tokens AGD + tráfego pago para maximizar seus ganhos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative transition-all hover:shadow-xl ${
                  pkg.popular ? "ring-2 ring-green-500 scale-105" : ""
                } ${selectedPackage === pkg.id ? "bg-green-50" : ""}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-zinc-800">{pkg.name}</CardTitle>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {pkg.monthlyPrice.toLocaleString()}/mês
                    </div>
                    <div className="text-sm text-zinc-500">
                      Total: R$ {pkg.totalPrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    <Badge variant="outline" className="border-green-600 text-green-600">
                      {pkg.monthlyTokens.toLocaleString()} Tokens/mês
                    </Badge>
                    <Badge variant="outline" className="border-blue-600 text-blue-600">
                      R$ {pkg.trafficBudget.toLocaleString()}/mês tráfego
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Dual Benefits */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Tokens */}
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Coins className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-xs font-medium text-green-800">Tokens</span>
                      </div>
                      <div className="text-xs text-green-700 text-center space-y-1">
                        <div>{pkg.totalTokens.toLocaleString()} total</div>
                        <div>{pkg.bonus}</div>
                      </div>
                    </div>

                    {/* Traffic */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <MousePointer className="w-4 h-4 text-blue-600 mr-1" />
                        <span className="text-xs font-medium text-blue-800">Tráfego</span>
                      </div>
                      <div className="text-xs text-blue-700 text-center space-y-1">
                        <div>~{pkg.expectedResults.estimatedClicks.toLocaleString()} cliques/mês</div>
                        <div>~{pkg.expectedResults.estimatedConversions} conversões</div>
                      </div>
                    </div>
                  </div>

                  {/* Token Projection */}
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-800">Projeção Tokens:</span>
                      <Badge variant="outline" className="text-xs border-purple-600 text-purple-600">
                        12 meses
                      </Badge>
                    </div>
                    <div className="text-xs text-purple-700 space-y-1">
                      <div>Hoje: R$ {pkg.tokenProjection.currentValue.toLocaleString()}</div>
                      <div>Projetado: R$ {pkg.tokenProjection.projectedValue12Months.toLocaleString()}</div>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {pkg.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                    onClick={() => {
                      setSelectedPackage(pkg.id)
                      handleSelectPlan(pkg.id)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Escolher Plano
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="text-xs text-center text-zinc-500">
                    Tokens + Tráfego • Cadastro gratuito
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">Como Funciona o Duplo Benefício</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: Calendar,
                title: "Escolha e Cadastre-se",
                description: "Selecione seu plano e faça seu cadastro gratuito com os dados do plano escolhido",
                color: "text-blue-600",
                bgColor: "bg-blue-50",
              },
              {
                step: "2",
                icon: Plus,
                title: "Duplo Recebimento",
                description: "Recebe tokens AGD (com bônus) para seu portfólio E tráfego pago para seu link",
                color: "text-green-600",
                bgColor: "bg-green-50",
              },
              {
                step: "3",
                icon: TrendingUp,
                title: "Duplo Ganho",
                description: "Tokens valorizam no tempo + tráfego gera vendas e comissões imediatas",
                color: "text-purple-600",
                bgColor: "bg-purple-50",
              },
            ].map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 mx-auto mb-4 ${item.bgColor} rounded-full flex items-center justify-center`}>
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-zinc-800 mb-2">
                    Passo {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-800 mb-2">{item.title}</h3>
                  <p className="text-zinc-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">Vantagens do Sistema Duplo</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Coins,
                title: "Tokens com Bônus",
                description: "Receba tokens AGD com até 25% de bônus para seu portfólio",
                color: "text-green-600",
              },
              {
                icon: Megaphone,
                title: "Tráfego Qualificado",
                description: "Visitantes interessados direcionados para seu link de afiliado",
                color: "text-blue-600",
              },
              {
                icon: TrendingUp,
                title: "Dupla Valorização",
                description: "Tokens valorizam + comissões de vendas geram renda imediata",
                color: "text-purple-600",
              },
              {
                icon: Shield,
                title: "Diversificação",
                description: "Invista em tokens E marketing, reduzindo riscos e maximizando ganhos",
                color: "text-orange-600",
              },
            ].map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <benefit.icon className={`w-12 h-12 mx-auto mb-4 ${benefit.color}`} />
                  <h3 className="text-lg font-semibold text-zinc-800 mb-2">{benefit.title}</h3>
                  <p className="text-zinc-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardContent className="p-12">
              <Plus className="w-16 h-16 mx-auto mb-6 text-green-100" />
              <h2 className="text-3xl font-bold mb-4">Comece Seu Duplo Benefício Hoje!</h2>
              <p className="text-xl mb-8 text-green-100">
                Receba tokens AGD + tráfego pago. Construa seu portfólio E sua rede de afiliados simultaneamente!
              </p>
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold"
                onClick={() => handleSelectPlan("professional")}
              >
                <Zap className="w-5 h-5 mr-2" />
                Começar com Professional
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <div className="mt-4 text-sm text-green-100">
                Plano mais popular • 3.450 tokens/mês + R$ 3.000/mês em tráfego • ~40 conversões estimadas
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">AGD Token</h3>
              <p className="text-zinc-400">
                Receba tokens AGD + tráfego pago. Duplo benefício para maximizar seus ganhos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <a href="/missao" className="hover:text-white">
                    Missões
                  </a>
                </li>
                <li>
                  <a href="/afiliado" className="hover:text-white">
                    Programa de Afiliados
                  </a>
                </li>
                <li>
                  <a href="/suporte" className="hover:text-white">
                    Suporte
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <a href="/termos" className="hover:text-white">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="/privacidade" className="hover:text-white">
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a href="/riscos" className="hover:text-white">
                    Aviso de Riscos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>contato@agdtoken.com</li>
                <li>+55 (11) 9999-9999</li>
                <li>São Paulo, SP</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-zinc-400">
            <p>&copy; 2024 AGD Token. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
