"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Play, Star, TrendingUp } from "lucide-react"

export default function OfertasPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [currentVideo, setCurrentVideo] = useState(0)
  const [language, setLanguage] = useState("pt")

  const utm = searchParams.get("utm") || "direct"
  const lang = searchParams.get("lang") || "pt"

  useEffect(() => {
    setLanguage(lang)
  }, [lang])

  const trackEvent = (eventName, parameters = {}) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, {
        ...parameters,
        utm_source: utm,
        language: language,
      })
    }
  }

  const videos = {
    pt: [
      {
        id: "intro",
        title: "Introdução ao AGD Token",
        description: "Descubra como investir em commodities com segurança",
        thumbnail: "/placeholder.svg?height=200&width=350&text=Video+Intro",
        duration: "3:45",
        embedId: "dQw4w9WgXcQ", // Placeholder YouTube ID
      },
      {
        id: "commodities",
        title: "Lastreamento em Commodities",
        description: "Entenda como funciona o lastro em soja, milho, café e ouro",
        thumbnail: "/placeholder.svg?height=200&width=350&text=Commodities",
        duration: "5:20",
        embedId: "dQw4w9WgXcQ",
      },
      {
        id: "returns",
        title: "Retornos e Rendimentos",
        description: "Veja os retornos históricos e projeções futuras",
        thumbnail: "/placeholder.svg?height=200&width=350&text=Retornos",
        duration: "4:15",
        embedId: "dQw4w9WgXcQ",
      },
    ],
    en: [
      {
        id: "intro",
        title: "AGD Token Introduction",
        description: "Discover how to invest in commodities safely",
        thumbnail: "/placeholder.svg?height=200&width=350&text=Video+Intro",
        duration: "3:45",
        embedId: "dQw4w9WgXcQ",
      },
      {
        id: "commodities",
        title: "Commodity Backing",
        description: "Understand how soy, corn, coffee and gold backing works",
        thumbnail: "/placeholder.svg?height=200&width=350&text=Commodities",
        duration: "5:20",
        embedId: "dQw4w9WgXcQ",
      },
      {
        id: "returns",
        title: "Returns and Yields",
        description: "See historical returns and future projections",
        thumbnail: "/placeholder.svg?height=200&width=350&text=Returns",
        duration: "4:15",
        embedId: "dQw4w9WgXcQ",
      },
    ],
  }

  const investmentPlans = {
    pt: [
      {
        id: "starter",
        name: "Plano Iniciante",
        minValue: 50,
        maxValue: 499,
        bonus: 5,
        currency: "R$",
        features: ["5% de bônus em tokens", "Acesso ao app mobile", "Suporte por email", "Relatórios mensais"],
        popular: false,
        color: "border-blue-500",
        bgColor: "bg-blue-50",
      },
      {
        id: "premium",
        name: "Plano Premium",
        minValue: 500,
        maxValue: 2499,
        bonus: 10,
        currency: "R$",
        features: [
          "10% de bônus em tokens",
          "Acesso prioritário a airdrops",
          "Suporte prioritário",
          "Relatórios semanais",
          "Consultoria básica",
        ],
        popular: true,
        color: "border-green-500",
        bgColor: "bg-green-50",
      },
      {
        id: "vip",
        name: "Plano VIP",
        minValue: 2500,
        maxValue: 9999,
        bonus: 15,
        currency: "R$",
        features: [
          "15% de bônus em tokens",
          "Acesso exclusivo a novos tokens",
          "Suporte 24/7",
          "Relatórios diários",
          "Consultoria personalizada",
          "Cashback em transações",
        ],
        popular: false,
        color: "border-purple-500",
        bgColor: "bg-purple-50",
      },
      {
        id: "enterprise",
        name: "Plano Corporativo",
        minValue: 10000,
        maxValue: 999999,
        bonus: 20,
        currency: "R$",
        features: [
          "20% de bônus em tokens",
          "Gestão de carteira dedicada",
          "Gerente de conta exclusivo",
          "Relatórios personalizados",
          "API para integração",
          "Liquidez prioritária",
        ],
        popular: false,
        color: "border-gold-500",
        bgColor: "bg-yellow-50",
      },
    ],
    en: [
      {
        id: "starter",
        name: "Starter Plan",
        minValue: 10,
        maxValue: 99,
        bonus: 5,
        currency: "$",
        features: ["5% token bonus", "Mobile app access", "Email support", "Monthly reports"],
        popular: false,
        color: "border-blue-500",
        bgColor: "bg-blue-50",
      },
      {
        id: "premium",
        name: "Premium Plan",
        minValue: 100,
        maxValue: 499,
        bonus: 10,
        currency: "$",
        features: [
          "10% token bonus",
          "Priority airdrop access",
          "Priority support",
          "Weekly reports",
          "Basic consulting",
        ],
        popular: true,
        color: "border-green-500",
        bgColor: "bg-green-50",
      },
      {
        id: "vip",
        name: "VIP Plan",
        minValue: 500,
        maxValue: 1999,
        bonus: 15,
        currency: "$",
        features: [
          "15% token bonus",
          "Exclusive new token access",
          "24/7 support",
          "Daily reports",
          "Personal consulting",
          "Transaction cashback",
        ],
        popular: false,
        color: "border-purple-500",
        bgColor: "bg-purple-50",
      },
      {
        id: "enterprise",
        name: "Enterprise Plan",
        minValue: 2000,
        maxValue: 999999,
        bonus: 20,
        currency: "$",
        features: [
          "20% token bonus",
          "Dedicated portfolio management",
          "Exclusive account manager",
          "Custom reports",
          "API integration",
          "Priority liquidity",
        ],
        popular: false,
        color: "border-gold-500",
        bgColor: "bg-yellow-50",
      },
    ],
  }

  const t = {
    pt: {
      title: "Escolha Seu Investimento",
      subtitle: "Assista aos vídeos e escolha o plano ideal para você",
      videoSection: "Vídeos Explicativos",
      plansSection: "Planos de Investimento",
      watchVideo: "Assistir Vídeo",
      selectPlan: "Escolher Plano",
      popular: "Mais Popular",
      bonus: "Bônus",
      from: "A partir de",
      to: "até",
      features: "Benefícios inclusos:",
      proceedPayment: "Prosseguir para Pagamento",
      backToHome: "Voltar ao Início",
    },
    en: {
      title: "Choose Your Investment",
      subtitle: "Watch the videos and choose the ideal plan for you",
      videoSection: "Explanatory Videos",
      plansSection: "Investment Plans",
      watchVideo: "Watch Video",
      selectPlan: "Choose Plan",
      popular: "Most Popular",
      bonus: "Bonus",
      from: "From",
      to: "to",
      features: "Included benefits:",
      proceedPayment: "Proceed to Payment",
      backToHome: "Back to Home",
    },
  }

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan)
    trackEvent("plan_selected", {
      plan_id: plan.id,
      plan_name: plan.name,
      min_value: plan.minValue,
      bonus: plan.bonus,
    })
  }

  const handlePayment = () => {
    if (!selectedPlan) return

    trackEvent("payment_redirect", {
      plan_id: selectedPlan.id,
      plan_name: selectedPlan.name,
      min_value: selectedPlan.minValue,
      bonus: selectedPlan.bonus,
    })

    // Redirecionar para o site oficial da AgroDeri com parâmetros
    const params = new URLSearchParams({
      plan: selectedPlan.id,
      amount: selectedPlan.minValue.toString(),
      bonus: selectedPlan.bonus.toString(),
      utm_source: utm,
      lang: language,
    })

    window.open(`https://www.agroderi.in?${params.toString()}`, "_blank")
  }

  const handleVideoPlay = (index) => {
    setCurrentVideo(index)
    trackEvent("video_play", {
      video_id: videos[language][index].id,
      video_title: videos[language][index].title,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-2xl font-bold text-green-800">AgroDeri AGD Token</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            {t[language].backToHome}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-16">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-900">{t[language].title}</h2>
          <p className="text-xl text-zinc-600 mb-8 max-w-3xl mx-auto">{t[language].subtitle}</p>
        </section>

        {/* Video Section */}
        <section className="py-12">
          <h3 className="text-3xl font-bold mb-8 text-center text-zinc-800">{t[language].videoSection}</h3>

          {/* Main Video Player */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videos[language][currentVideo].embedId}`}
                title={videos[language][currentVideo].title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="mt-4 text-center">
              <h4 className="text-2xl font-semibold text-zinc-800 mb-2">{videos[language][currentVideo].title}</h4>
              <p className="text-zinc-600">{videos[language][currentVideo].description}</p>
            </div>
          </div>

          {/* Video Thumbnails */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {videos[language].map((video, index) => (
              <Card
                key={video.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  currentVideo === index ? "ring-2 ring-green-500" : ""
                }`}
                onClick={() => handleVideoPlay(index)}
              >
                <CardContent className="p-4">
                  <div className="relative mb-3">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-32 object-cover rounded"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <h5 className="font-semibold text-sm mb-1">{video.title}</h5>
                  <p className="text-xs text-zinc-600">{video.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Investment Plans Section */}
        <section className="py-12">
          <h3 className="text-3xl font-bold mb-8 text-center text-zinc-800">{t[language].plansSection}</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {investmentPlans[language].map((plan) => (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-xl cursor-pointer ${
                  selectedPlan?.id === plan.id ? `ring-2 ${plan.color}` : ""
                } ${plan.bgColor}`}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      {t[language].popular}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-zinc-800">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {plan.bonus}% <span className="text-sm font-normal">{t[language].bonus}</span>
                  </div>
                  <div className="text-lg text-zinc-600">
                    {t[language].from} {plan.currency}
                    {plan.minValue.toLocaleString()} {t[language].to} {plan.currency}
                    {plan.maxValue.toLocaleString()}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-zinc-700 mb-3">{t[language].features}</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-zinc-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className={`w-full ${
                      selectedPlan?.id === plan.id
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-white border-2 border-green-600 text-green-600 hover:bg-green-50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlanSelect(plan)
                    }}
                  >
                    {selectedPlan?.id === plan.id ? "✓ Selecionado" : t[language].selectPlan}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Payment CTA */}
        {selectedPlan && (
          <section className="py-12">
            <div className="max-w-2xl mx-auto text-center">
              <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Plano Selecionado: {selectedPlan.name}</h3>
                  <div className="text-lg mb-6">
                    <div className="flex justify-center items-center space-x-4 mb-2">
                      <span>
                        Investimento: {selectedPlan.currency}
                        {selectedPlan.minValue.toLocaleString()} - {selectedPlan.currency}
                        {selectedPlan.maxValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-center items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Bônus: {selectedPlan.bonus}% em tokens AGD</span>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-lg px-8 py-4 bg-white text-green-700 hover:bg-zinc-50 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handlePayment}
                  >
                    {t[language].proceedPayment}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
