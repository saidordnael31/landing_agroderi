"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { CheckCircle, Shield, TrendingUp, Users, Zap, Gift } from "lucide-react"

export default function AGDLandingPage() {
  const router = useRouter()
  const [language, setLanguage] = useState("pt")

  useEffect(() => {
    // Configuração do Google Analytics
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || []
      function gtag(...args) {
        window.dataLayer.push(args)
      }
      gtag("js", new Date())
      gtag("config", "G-XXXXXXX") // Substituir pelo ID real

      // Track page view
      gtag("event", "page_view", {
        page_title: "AGD Landing Page",
        page_location: window.location.href,
        language: language,
      })
    }
  }, [language])

  const trackEvent = (eventName, parameters = {}) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, {
        ...parameters,
        language: language,
      })
    }
  }

  const t = {
    pt: {
      heroTitle: "Invista em tokens AGD lastreados em commodities reais",
      heroSubtitle: "Receba bônus, participe de airdrops e ganhe em dólar digital (USDT)",
      cta: "Começar Agora",
      carousel: [
        {
          id: "upsell",
          title: "Ganhe em dobro",
          desc: "Invista R$500+ e desbloqueie bônus exclusivos.",
          cta: "Quero Ganhar Mais",
          icon: TrendingUp,
          color: "bg-green-500",
        },
        {
          id: "crosssell",
          title: "Ganhos recorrentes",
          desc: "Conheça os planos com rendimento em USDT.",
          cta: "Ver Planos",
          icon: Zap,
          color: "bg-blue-500",
        },
        {
          id: "downsell",
          title: "Comece pequeno",
          desc: "Invista a partir de R$50 e ganhe 5% de bônus.",
          cta: "Começar Agora",
          icon: Users,
          color: "bg-purple-500",
        },
        {
          id: "bonus",
          title: "Ganhe tokens grátis",
          desc: "Compartilhe com amigos e receba bônus automáticos.",
          cta: "Quero Participar",
          icon: Gift,
          color: "bg-orange-500",
        },
        {
          id: "airdrop",
          title: "Missão AGD",
          desc: "Participe de tarefas simples e ganhe tokens.",
          cta: "Entrar na Missão",
          icon: Shield,
          color: "bg-red-500",
        },
      ],
      bullets: [
        "Lastreado em soja, milho, café, petróleo e ouro",
        "Tokens recebidos em USDT ou AGD",
        "Auditoria global (CLA Global) e emissão via Capitare.io",
      ],
      flowSteps: ["Comece", "Escolha valor", "Ganhe bônus", "Receba tokens", "Renda extra"],
      trustTitle: "Por que confiar no AGD?",
      howItWorksTitle: "Como Funciona",
      affiliateProgram: "Programa de Afiliados",
      affiliateDesc: "Ganhe até 15% de comissão vendendo AGD Token",
      memberArea: "Área do Membro",
      memberDesc: "Acesse sua carteira e investimentos",
    },
    en: {
      heroTitle: "Invest in AGD tokens backed by real commodities",
      heroSubtitle: "Get bonuses, join airdrops and earn in digital dollars (USDT)",
      cta: "Start Now",
      carousel: [
        {
          id: "upsell",
          title: "Double your bonus",
          desc: "Invest $100+ and unlock exclusive rewards.",
          cta: "Get More Bonus",
          icon: TrendingUp,
          color: "bg-green-500",
        },
        {
          id: "crosssell",
          title: "Recurring earnings",
          desc: "Explore staking plans with USDT returns.",
          cta: "See Plans",
          icon: Zap,
          color: "bg-blue-500",
        },
        {
          id: "downsell",
          title: "Start small, grow fast",
          desc: "Invest from just $10 and get 5% bonus.",
          cta: "Start Now",
          icon: Users,
          color: "bg-purple-500",
        },
        {
          id: "bonus",
          title: "Free token rewards",
          desc: "Refer friends and get rewarded instantly.",
          cta: "Join Now",
          icon: Gift,
          color: "bg-orange-500",
        },
        {
          id: "airdrop",
          title: "AGD Challenge",
          desc: "Complete simple tasks to earn tokens.",
          cta: "Join Mission",
          icon: Shield,
          color: "bg-red-500",
        },
      ],
      bullets: [
        "Backed by soy, corn, coffee, oil and gold",
        "Receive tokens in USDT or AGD",
        "Audited by CLA Global, issued via Capitare.io",
      ],
      flowSteps: ["Start", "Choose amount", "Get bonus", "Receive tokens", "Earn extra"],
      trustTitle: "Why trust AGD?",
      howItWorksTitle: "How it works",
      affiliateProgram: "Affiliate Program",
      affiliateDesc: "Earn up to 15% commission selling AGD Token",
      memberArea: "Member Area",
      memberDesc: "Access your wallet and investments",
    },
  }

  const handleNavigation = (path, utmSource) => {
    trackEvent("navigation_click", {
      destination: path,
      utm_source: utmSource,
    })

    router.push(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 text-zinc-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-2xl font-bold text-green-800">AgroDeri AGD Token</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation("/afiliado/cadastro", "header_affiliate")}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              {t[language].affiliateProgram}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation("/membro/login", "header_member")}
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              {t[language].memberArea}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newLang = language === "pt" ? "en" : "pt"
                setLanguage(newLang)
                trackEvent("language_change", { new_language: newLang })
              }}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              {language === "pt" ? "EN" : "PT"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{t[language].heroTitle}</h2>
          <p className="text-xl md:text-2xl mb-8 text-zinc-600 max-w-4xl mx-auto">{t[language].heroSubtitle}</p>
          <Button
            size="lg"
            className="text-lg px-8 py-4 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => {
              trackEvent("hero_cta_click", { language: language })
              handleNavigation("/ofertas", "hero_cta")
            }}
          >
            {t[language].cta}
          </Button>
        </section>

        {/* Carousel Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto">
            <Carousel className="w-full">
              <CarouselContent>
                {t[language].carousel.map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                      <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6 text-center">
                          <div
                            className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                          >
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-semibold mb-3 text-zinc-800">{item.title}</h3>
                          <p className="mb-6 text-zinc-600 leading-relaxed">{item.desc}</p>
                          <Button
                            variant="secondary"
                            className="w-full hover:bg-zinc-100 transition-colors duration-200"
                            onClick={() => {
                              trackEvent("carousel_click", {
                                item_id: item.id,
                                item_title: item.title,
                              })
                              if (item.id === "airdrop") {
                                handleNavigation(`/missao?utm=airdrop&lang=${language}`, "airdrop")
                              } else {
                                handleNavigation(`/ofertas?utm=${item.id}&lang=${language}`, item.id)
                              }
                            }}
                          >
                            {item.cta}
                          </Button>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-8 text-center text-zinc-800">{t[language].trustTitle}</h3>
            <div className="grid md:grid-cols-1 gap-6">
              {t[language].bullets.map((bullet, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-lg text-zinc-700">{bullet}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-16 text-center">
          <h3 className="text-3xl font-bold mb-12 text-zinc-800">{t[language].howItWorksTitle}</h3>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {t[language].flowSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-green-100 border-2 border-green-200 px-6 py-3 rounded-full font-semibold text-green-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <span className="text-sm font-bold text-green-600 mr-2">{index + 1}.</span>
                  {step}
                </div>
                {index < t[language].flowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-green-300 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Affiliate Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white shadow-xl mb-8">
              <h3 className="text-3xl font-bold mb-4">{t[language].affiliateProgram}</h3>
              <p className="text-xl mb-8 opacity-90">{t[language].affiliateDesc}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-4 bg-white text-blue-700 hover:bg-zinc-50 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => handleNavigation("/afiliado/cadastro", "affiliate_section")}
                >
                  Cadastrar como Afiliado
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 bg-transparent"
                  onClick={() => handleNavigation("/afiliado/login", "affiliate_login")}
                >
                  Login Afiliado
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 text-center">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-12 text-white shadow-xl">
            <h3 className="text-3xl font-bold mb-4">
              {language === "pt" ? "Pronto para começar?" : "Ready to start?"}
            </h3>
            <p className="text-xl mb-8 opacity-90">
              {language === "pt"
                ? "Junte-se a milhares de investidores que já confiam no AGD Token"
                : "Join thousands of investors who already trust AGD Token"}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-4 bg-white text-green-700 hover:bg-zinc-50 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  trackEvent("final_cta_click", { language: language })
                  handleNavigation("/ofertas", "final_cta")
                }}
              >
                {t[language].cta}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-green-700 shadow-lg hover:shadow-xl transition-all duration-300 bg-transparent"
                onClick={() => handleNavigation("/membro/login", "member_cta")}
              >
                {t[language].memberArea}
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-400">
            © 2024 AgroDeri AGD Token. {language === "pt" ? "Todos os direitos reservados." : "All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  )
}
