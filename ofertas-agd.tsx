"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Shield,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const offers = [
  {
    id: "plano1",
    title: "Comece Pequeno",
    subtitle: "Ideal para iniciantes",
    video: "/videos/entrada-baixa.mp4",
    bonus: "5% de bônus em tokens AGD",
    bonusPercent: 5,
    value: "R$50 a R$999",
    minValue: 50,
    maxValue: 999,
    url: "https://agroderi.vercel.app/?utm=plano1",
    color: "bg-blue-500",
    features: ["Entrada acessível", "Bônus garantido", "Suporte completo"],
    popular: false,
  },
  {
    id: "plano2",
    title: "Plano Intermediário",
    subtitle: "Melhor custo-benefício",
    video: "/videos/bonus-15.mp4",
    bonus: "15% de bônus para aportes acima de R$1.000",
    bonusPercent: 15,
    value: "R$1.000 a R$4.999",
    minValue: 1000,
    maxValue: 4999,
    url: "https://agroderi.vercel.app/?utm=plano2",
    color: "bg-green-500",
    features: ["Bônus elevado", "Prioridade no suporte", "Relatórios exclusivos"],
    popular: true,
  },
  {
    id: "plano3",
    title: "Plano Premium",
    subtitle: "Máximo retorno",
    video: "/videos/bonus-40.mp4",
    bonus: "Aporte acima de R$5.000 e receba 40% de bônus no TGE",
    bonusPercent: 40,
    value: "A partir de R$5.000",
    minValue: 5000,
    maxValue: null,
    url: "https://agroderi.vercel.app/?utm=plano3",
    color: "bg-purple-500",
    features: ["Bônus máximo", "Acesso VIP", "Consultoria personalizada"],
    popular: false,
  },
]

export default function OfertasAGD() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [language, setLanguage] = useState("pt")
  const [isMuted, setIsMuted] = useState(true)
  const [videoLoaded, setVideoLoaded] = useState(false)

  const t = {
    pt: {
      title: "🎯 Escolha sua Oferta",
      subtitle: "Selecione o plano ideal para seu investimento",
      goToPayment: "Ir para Pagamento",
      popular: "Mais Popular",
      features: "Benefícios inclusos:",
      bonus: "Bônus",
      investment: "Investimento",
      next: "Próximo",
      previous: "Anterior",
      loading: "Carregando vídeo...",
      securePayment: "Pagamento 100% seguro",
      limitedTime: "Oferta por tempo limitado",
    },
    en: {
      title: "🎯 Choose Your Offer",
      subtitle: "Select the ideal plan for your investment",
      goToPayment: "Go to Payment",
      popular: "Most Popular",
      features: "Included benefits:",
      bonus: "Bonus",
      investment: "Investment",
      next: "Next",
      previous: "Previous",
      loading: "Loading video...",
      securePayment: "100% secure payment",
      limitedTime: "Limited time offer",
    },
  }

  useEffect(() => {
    // Track page view
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "offers_page_view", {
        language: language,
      })
    }
  }, [language])

  const handleOfferSelect = (offerIndex) => {
    setStep(offerIndex)

    // Track offer view
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "offer_view", {
        offer_id: offers[offerIndex].id,
        offer_title: offers[offerIndex].title,
        bonus_percent: offers[offerIndex].bonusPercent,
        language: language,
      })
    }
  }

  const handlePaymentClick = () => {
    const currentOffer = offers[step]

    // Track conversion intent
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "payment_intent", {
        offer_id: currentOffer.id,
        offer_title: currentOffer.title,
        bonus_percent: currentOffer.bonusPercent,
        min_value: currentOffer.minValue,
        language: language,
      })
    }

    router.push(currentOffer.url)
  }

  const currentOffer = offers[step]
  const progress = ((step + 1) / offers.length) * 100

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
            size="sm"
            onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            {language === "pt" ? "EN" : "PT"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-10">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-800">{t[language].title}</h1>
          <p className="text-xl text-zinc-600 mb-6">{t[language].subtitle}</p>

          {/* Progress Indicator */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between text-sm text-zinc-600 mb-2">
              <span>
                Plano {step + 1} de {offers.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Main Offer Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="shadow-2xl border-2 border-zinc-200 overflow-hidden">
            {currentOffer.popular && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2">
                <Badge variant="secondary" className="bg-white text-green-600 font-bold">
                  ⭐ {t[language].popular}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className={`w-12 h-12 ${currentOffer.color} rounded-full flex items-center justify-center`}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl">{currentOffer.title}</CardTitle>
                  <p className="text-zinc-600">{currentOffer.subtitle}</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4 mt-4">
                <Badge variant="outline" className="border-green-500 text-green-700 px-3 py-1">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  {currentOffer.bonusPercent}% {t[language].bonus}
                </Badge>
                <Badge variant="outline" className="border-blue-500 text-blue-700 px-3 py-1">
                  {currentOffer.value}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Video Section */}
              <div className="relative mb-6 rounded-xl overflow-hidden bg-zinc-900">
                {!videoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-white">
                    <div className="text-center">
                      <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t[language].loading}</p>
                    </div>
                  </div>
                )}

                <video
                  src={currentOffer.video}
                  className="w-full aspect-video"
                  controls
                  autoPlay
                  muted={isMuted}
                  onLoadedData={() => setVideoLoaded(true)}
                  poster="/placeholder.svg?height=400&width=600"
                />

                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-none"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>

              {/* Offer Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    {t[language].features}
                  </h3>
                  <ul className="space-y-2">
                    {currentOffer.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-zinc-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-center">{currentOffer.bonus}</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{currentOffer.bonusPercent}%</div>
                    <p className="text-sm text-zinc-600">{t[language].bonus} garantido</p>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex justify-center space-x-6 mb-6 text-sm text-zinc-600">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1 text-green-600" />
                  {t[language].securePayment}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-orange-600" />
                  {t[language].limitedTime}
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handlePaymentClick}
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-6"
              >
                {t[language].goToPayment}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center space-x-4 mb-8">
          <Button
            variant="outline"
            onClick={() => handleOfferSelect(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t[language].previous}
          </Button>

          <div className="flex space-x-2">
            {offers.map((offer, index) => (
              <Button
                key={index}
                size="sm"
                variant={index === step ? "default" : "outline"}
                onClick={() => handleOfferSelect(index)}
                className={`w-12 h-12 rounded-full ${
                  index === step
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "border-green-600 text-green-600 hover:bg-green-50"
                }`}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => handleOfferSelect(Math.min(offers.length - 1, step + 1))}
            disabled={step === offers.length - 1}
            className="flex items-center"
          >
            {t[language].next}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Offer Comparison */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-zinc-800">Compare todos os planos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {offers.map((offer, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  index === step ? "ring-2 ring-green-500 shadow-lg" : ""
                } ${offer.popular ? "border-green-500" : ""}`}
                onClick={() => handleOfferSelect(index)}
              >
                {offer.popular && (
                  <div className="bg-green-500 text-white text-center py-1 text-sm font-medium">Mais Popular</div>
                )}
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-10 h-10 ${offer.color} rounded-full flex items-center justify-center mx-auto mb-3`}
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{offer.title}</h3>
                  <div className="text-2xl font-bold text-green-600 mb-2">{offer.bonusPercent}%</div>
                  <p className="text-sm text-zinc-600 mb-3">{offer.value}</p>
                  <Badge variant="outline" className="text-xs">
                    {offer.features.length} benefícios
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
