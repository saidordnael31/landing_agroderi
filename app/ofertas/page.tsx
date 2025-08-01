"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
  Star,
  Clock,
  DollarSign,
  Zap,
  Target,
  Gift,
  ArrowRight,
  Eye,
} from "lucide-react"

// Dados dos vídeos reais do Vimeo
const videos = [
  {
    id: "1106579696",
    title: "AGD Token: O Futuro do Agronegócio",
    description: "Descubra como o AGD Token está revolucionando o setor agrícola com tecnologia blockchain",
    duration: "12:20",
    thumbnail:
      "https://sjc.microlink.io/gBxIItfrCFQ0h_l-cLrCed88O4QjSoT_w00YoNrdhg98srAFYizRZP0U2viUHpt92KVO2m6Qw1ErqmECoyc-Jg.jpeg",
    isMain: true,
  },
  {
    id: "1104233124",
    title: "Estratégias de Investimento em Startups",
    description: "Aprenda as 3 formas principais de investir em startups do agronegócio",
    duration: "15:30",
    thumbnail:
      "https://sjc.microlink.io/fX37B9szc_xR64LjAJtjbcWvThr7_KIsEacAGso-6gzMoM9yP6a-21PDi0XCrgmGos8pk-Uvb6UoCccZ75fzVg.jpeg",
    isMain: false,
  },
  {
    id: "1104226648",
    title: "Anúncio Especial AGD Token",
    description: "Apresentação especial sobre as oportunidades do AGD Token",
    duration: "8:45",
    thumbnail:
      "https://sjc.microlink.io/fMSavLgXt0OrjsNYD1bUOJxVYUzCOT3i2hrUdI6RekBaxo4N-vimOVVGwrRMM_HI-FX9Kk236eZC3I6ujLLOug.jpeg",
    isMain: false,
  },
  {
    id: "1102008931",
    title: "Análise de Mercado e Estratégias",
    description: "Entenda o mercado e as estratégias para maximizar seus investimentos",
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
  const [selectedPackage, setSelectedPackage] = useState("premium")

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

  const handleInvestment = async (packageType: string, amount: number) => {
    try {
      console.log("💰 [CHECKOUT] Iniciando investimento:", { packageType, amount, affiliateCode })

      const response = await fetch("/api/investments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: packageType,
          amount,
          affiliateCode,
          source: "ofertas_page",
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirecionar para checkout ou página de sucesso
        window.location.href = data.checkoutUrl || "/checkout"
      } else {
        alert("Erro ao processar investimento. Tente novamente.")
      }
    } catch (error) {
      console.error("💥 [CHECKOUT] Erro:", error)
      alert("Erro ao processar investimento. Tente novamente.")
    }
  }

  const packages = [
    {
      id: "starter",
      name: "Starter",
      price: 500,
      tokens: 500,
      bonus: "10% bônus",
      features: ["500 AGD Tokens", "10% de bônus", "Suporte básico", "Acesso à plataforma"],
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: 1000,
      tokens: 1200,
      bonus: "20% bônus",
      features: ["1.000 AGD Tokens", "20% de bônus", "Suporte prioritário", "Análises exclusivas", "Webinars mensais"],
      popular: true,
    },
    {
      id: "elite",
      name: "Elite",
      price: 5000,
      tokens: 6500,
      bonus: "30% bônus",
      features: [
        "5.000 AGD Tokens",
        "30% de bônus",
        "Suporte VIP",
        "Consultoria personalizada",
        "Acesso antecipado",
        "Relatórios detalhados",
      ],
      popular: false,
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
            Invista no Futuro do
            <span className="text-green-600 block">Agronegócio</span>
          </h1>
          <p className="text-xl text-zinc-600 mb-8 max-w-3xl mx-auto">
            O AGD Token é o primeiro token digital lastreado em commodities agrícolas reais. Invista com segurança e
            participe da revolução do agronegócio digital.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              100% Lastreado
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Alta Rentabilidade
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              +10.000 Investidores
            </Badge>
          </div>
        </div>

        {/* Video Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">
              Assista aos vídeos exclusivos e entenda como o AGD Token está revolucionando o agronegócio
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
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">Escolha Seu Pacote de Investimento</h2>
            <p className="text-xl text-zinc-600">
              Invista em AGD Tokens e participe do crescimento do agronegócio digital
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
                    <span className="text-4xl font-bold text-green-600">R$ {pkg.price.toLocaleString()}</span>
                  </div>
                  <Badge variant="outline" className="mt-2 border-green-600 text-green-600">
                    {pkg.tokens.toLocaleString()} Tokens + {pkg.bonus}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-zinc-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                    onClick={() => {
                      setSelectedPackage(pkg.id)
                      handleInvestment(pkg.id, pkg.price)
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Investir Agora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">Por que Investir em AGD Token?</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Segurança Total",
                description: "100% lastreado em commodities agrícolas reais",
                color: "text-green-600",
              },
              {
                icon: TrendingUp,
                title: "Alta Rentabilidade",
                description: "Potencial de valorização com o crescimento do agronegócio",
                color: "text-blue-600",
              },
              {
                icon: Zap,
                title: "Liquidez Imediata",
                description: "Converta seus tokens em dinheiro a qualquer momento",
                color: "text-yellow-600",
              },
              {
                icon: Target,
                title: "Transparência",
                description: "Acompanhe seus investimentos em tempo real",
                color: "text-purple-600",
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
              <Gift className="w-16 h-16 mx-auto mb-6 text-green-100" />
              <h2 className="text-3xl font-bold mb-4">Oferta Limitada!</h2>
              <p className="text-xl mb-8 text-green-100">
                Invista agora e ganhe até 30% de bônus em tokens. Oferta válida por tempo limitado!
              </p>
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold"
                onClick={() => handleInvestment("premium", 1000)}
              >
                <Zap className="w-5 h-5 mr-2" />
                Garantir Meu Investimento
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
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
              <p className="text-zinc-400">O futuro do agronegócio está aqui. Invista com segurança e transparência.</p>
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
