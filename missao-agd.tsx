"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Instagram, MessageCircle, Wallet, Gift, ArrowRight, Star } from "lucide-react"

export default function MissaoAGD() {
  const [wallet, setWallet] = useState("")
  const [email, setEmail] = useState("")
  const [step, setStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [language, setLanguage] = useState("pt")

  const t = {
    pt: {
      title: "🎯 Missão AGD",
      subtitle: "Complete as tarefas e ganhe tokens AGD grátis!",
      reward: "Recompensa: 50 AGD Tokens",
      stepOf: "Etapa {current} de {total}",
      markDone: "Marcar como Feito",
      submit: "Enviar Missão",
      submitting: "Enviando...",
      success: "🎉 Missão enviada com sucesso!",
      successDesc: "Seus tokens AGD serão enviados após verificação em até 24 horas.",
      walletPlaceholder: "Sua carteira (ex: 0x...)",
      emailPlaceholder: "Seu e-mail",
      completed: "Concluído",
      current: "Atual",
      pending: "Pendente",
      steps: [
        {
          title: "Siga nosso Instagram",
          desc: "Acesse e siga: @AgroDeri_Oficial para ficar por dentro das novidades",
          link: "https://www.instagram.com/AgroDeri_Oficial",
          icon: Instagram,
          color: "bg-pink-500",
        },
        {
          title: "Compartilhe com amigos",
          desc: "Envie para 3 amigos no WhatsApp e ajude a comunidade crescer",
          link: "https://api.whatsapp.com/send?text=Conheça%20o%20AGD%20Token%20da%20AgroDeri:%20https://agroderi.com",
          icon: MessageCircle,
          color: "bg-green-500",
        },
        {
          title: "Dados para recebimento",
          desc: "Insira sua carteira e e-mail para receber os tokens",
          icon: Wallet,
          color: "bg-blue-500",
        },
      ],
    },
    en: {
      title: "🎯 AGD Mission",
      subtitle: "Complete the tasks and earn free AGD tokens!",
      reward: "Reward: 50 AGD Tokens",
      stepOf: "Step {current} of {total}",
      markDone: "Mark as Done",
      submit: "Submit Mission",
      submitting: "Submitting...",
      success: "🎉 Mission submitted successfully!",
      successDesc: "Your AGD tokens will be sent after verification within 24 hours.",
      walletPlaceholder: "Your wallet (e.g., 0x...)",
      emailPlaceholder: "Your email",
      completed: "Completed",
      current: "Current",
      pending: "Pending",
      steps: [
        {
          title: "Follow our Instagram",
          desc: "Access and follow: @AgroDeri_Oficial to stay updated",
          link: "https://www.instagram.com/AgroDeri_Oficial",
          icon: Instagram,
          color: "bg-pink-500",
        },
        {
          title: "Share with friends",
          desc: "Send to 3 friends on WhatsApp and help the community grow",
          link: "https://api.whatsapp.com/send?text=Discover%20AGD%20Token%20from%20AgroDeri:%20https://agroderi.com",
          icon: MessageCircle,
          color: "bg-green-500",
        },
        {
          title: "Payment details",
          desc: "Enter your wallet and email to receive the tokens",
          icon: Wallet,
          color: "bg-blue-500",
        },
      ],
    },
  }

  const progress = ((step + 1) / t[language].steps.length) * 100
  const isFinal = step >= t[language].steps.length - 1
  const isCompleted = step >= t[language].steps.length

  useEffect(() => {
    // Track mission page view
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "mission_page_view", {
        language: language,
      })
    }
  }, [language])

  const handleStepComplete = (stepIndex) => {
    const currentStep = t[language].steps[stepIndex]

    // Track step completion
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "mission_step_complete", {
        step_index: stepIndex,
        step_title: currentStep.title,
        language: language,
      })
    }

    if (currentStep.link) {
      window.open(currentStep.link, "_blank")
    }

    setCompletedSteps((prev) => new Set([...prev, stepIndex]))

    setTimeout(() => {
      setStep(stepIndex + 1)
    }, 500)
  }

  const handleSubmit = async () => {
    if (!wallet || !email) return

    setIsSubmitting(true)

    // Track mission submission
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "mission_submit", {
        wallet_address: wallet.substring(0, 6) + "...", // Privacy-safe tracking
        language: language,
      })
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setStep(t[language].steps.length)
    setIsSubmitting(false)
  }

  const validateWallet = (address) => {
    return address.match(/^0x[a-fA-F0-9]{40}$/) || address.length > 20
  }

  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 px-4 py-10">
        <div className="max-w-md mx-auto">
          <Card className="border-green-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-green-800 mb-2">{t[language].success}</h1>
              <p className="text-zinc-600 mb-6">{t[language].successDesc}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold text-green-800">{t[language].reward}</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Voltar ao Início
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 px-4 py-10">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-zinc-800">{t[language].title}</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              {language === "pt" ? "EN" : "PT"}
            </Button>
          </div>
          <p className="text-zinc-600 mb-4">{t[language].subtitle}</p>
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            {t[language].reward}
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-zinc-600 mb-2">
            <span>
              {t[language].stepOf.replace("{current}", step + 1).replace("{total}", t[language].steps.length)}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Overview */}
        <div className="mb-8 space-y-3">
          {t[language].steps.map((stepItem, index) => {
            const IconComponent = stepItem.icon
            const isCurrentStep = index === step
            const isCompletedStep = completedSteps.has(index)
            const isPendingStep = index > step

            return (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  isCurrentStep
                    ? "bg-blue-50 border-2 border-blue-200"
                    : isCompletedStep
                      ? "bg-green-50 border border-green-200"
                      : "bg-zinc-50 border border-zinc-200"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompletedStep ? "bg-green-500" : isCurrentStep ? stepItem.color : "bg-zinc-300"
                  }`}
                >
                  {isCompletedStep ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <IconComponent className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${isCurrentStep ? "text-blue-800" : "text-zinc-700"}`}>
                    {stepItem.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        isCompletedStep
                          ? "border-green-500 text-green-700"
                          : isCurrentStep
                            ? "border-blue-500 text-blue-700"
                            : "border-zinc-300 text-zinc-500"
                      }`}
                    >
                      {isCompletedStep
                        ? t[language].completed
                        : isCurrentStep
                          ? t[language].current
                          : t[language].pending}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Current Step Card */}
        <Card className="shadow-lg border-2 border-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 ${t[language].steps[step].color} rounded-full flex items-center justify-center`}
              >
                {React.createElement(t[language].steps[step].icon, { className: "w-6 h-6 text-white" })}
              </div>
              <div>
                <CardTitle className="text-xl">{t[language].steps[step].title}</CardTitle>
                <p className="text-zinc-600 text-sm mt-1">{t[language].steps[step].desc}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {!isFinal ? (
              <Button
                onClick={() => handleStepComplete(step)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                {t[language].markDone}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Input
                      placeholder={t[language].walletPlaceholder}
                      value={wallet}
                      onChange={(e) => setWallet(e.target.value)}
                      className={`${wallet && !validateWallet(wallet) ? "border-red-300 focus:border-red-500" : ""}`}
                    />
                    {wallet && !validateWallet(wallet) && (
                      <p className="text-red-500 text-sm mt-1">Endereço de carteira inválido</p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder={t[language].emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${email && !validateEmail(email) ? "border-red-300 focus:border-red-500" : ""}`}
                    />
                    {email && !validateEmail(email) && <p className="text-red-500 text-sm mt-1">E-mail inválido</p>}
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!wallet || !email || !validateWallet(wallet) || !validateEmail(email) || isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  {isSubmitting ? t[language].submitting : t[language].submit}
                  {!isSubmitting && <Gift className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
