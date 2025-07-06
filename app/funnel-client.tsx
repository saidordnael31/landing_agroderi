"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { Gift, Languages, ShieldOff, Coins, Flame, MessageSquare, BookOpen, Building, Users } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import Link from "next/link"

const translations = {
  pt: {
    welcome: "Sua jornada de valor começa agora!",
    subWelcome:
      "Cada passo aqui gera recompensas em tokens AGD. Em 3 meses, você pode sacar ou reinvestir para ver seu patrimônio crescer.",
    namePrompt: "Qual é o seu nome?",
    emailPrompt: "{name}, qual seu melhor e-mail?",
    profilePrompt: "Seu nível de experiência com cripto:",
    profileOptions: {
      novice: "Iniciante",
      intermediate: "Intermediário",
      advanced: "Avançado",
      distrustful: "Não confio / Não quero ver isso novamente",
    },
    continue: "Continuar",
    finalTitle: "Parabéns, {name}!",
    finalSubtitle: "Você acumulou {tokens} tokens AGD!",
    finalValue: "Valor equivalente: ${value}",
    affiliateCTA: "Seja Afiliado",
    rewardUnlocked: "Recompensa desbloqueada!",
    buyNow: "Comprar AGD",
    emailReward: "Enviamos as instruções para {email}",
    upsellTitle: "Potencialize Seus Ganhos",
    upsellText: "Adquira nosso curso Web3 e ganhe +100 tokens AGD.",
    upsellCTA: "Quero o Bônus",
    downsellTitle: "Acompanhe de Perto",
    downsellText: "Entre no nosso grupo exclusivo do WhatsApp.",
    downsellCTA: "Entrar no Grupo",
    crosssellTitle: "Venda Conosco",
    crosssellText: "Ganhe até 40% de comissão como afiliado.",
    languageName: "Português",
    videoTitle: "Entenda o Projeto em 1 Minuto",
    credibilityTitle: "Nossa Credibilidade",
    credibilityLinks: {
      whitepaper: "Whitepaper e Tokenomics",
      akintec: "Conheça a Akintec",
      agroderi: "Conheça a Agroderi",
      investors: "Investidores: Google e Nubank",
    },
    contactTitle: "Fale com um Especialista",
    contactText: "Tire suas dúvidas ou marque uma reunião.",
    contactCTA: "Conversar no WhatsApp",
    tokensEarned: "Tokens Ganhos",
    distrustfulTitle: "Agradecemos seu feedback.",
    distrustfulText:
      "Respeitamos sua decisão. Se mudar de ideia, nosso whitepaper está disponível para consulta. A transparência é um dos nossos maiores valores.",
    distrustfulCTA: "Ver Whitepaper",
    carouselTitles: {
      novice: "Comece com Segurança",
      intermediate: "Acelere seus Ganhos",
      advanced: "Ferramentas para Experts",
      distrustful: "Construindo Confiança",
    },
  },
  en: {
    welcome: "Your value journey starts now!",
    subWelcome:
      "Every step here earns you rewards in AGD tokens. In 3 months, you can withdraw or reinvest to watch your assets grow.",
    namePrompt: "What is your name?",
    emailPrompt: "{name}, what's your best email?",
    profilePrompt: "Your crypto experience level:",
    profileOptions: {
      novice: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      distrustful: "Distrustful",
    },
    continue: "Continue",
    finalTitle: "Congratulations, {name}!",
    finalSubtitle: "You've earned {tokens} AGD tokens!",
    finalValue: "Equivalent value: ${value}",
    affiliateCTA: "Become an Affiliate",
    rewardUnlocked: "Reward unlocked!",
    buyNow: "Buy AGD",
    emailReward: "We sent instructions to {email}",
    upsellTitle: "Boost Your Earnings",
    upsellText: "Buy our Web3 course and get +100 AGD tokens.",
    upsellCTA: "Get Bonus",
    downsellTitle: "Follow Closely",
    downsellText: "Join our exclusive WhatsApp group.",
    downsellCTA: "Join Group",
    crosssellTitle: "Sell With Us",
    crosssellText: "Earn up to 40% commission as an affiliate.",
    languageName: "English",
    videoTitle: "Understand the Project in 1 Minute",
    credibilityTitle: "Our Credentials",
    credibilityLinks: {
      whitepaper: "Whitepaper & Tokenomics",
      akintec: "Meet Akintec",
      agroderi: "Meet Agroderi",
      investors: "Investors: Google & Nubank",
    },
    contactTitle: "Talk to a Specialist",
    contactText: "Ask questions or schedule a meeting.",
    contactCTA: "Chat on WhatsApp",
    tokensEarned: "Tokens Earned",
    distrustfulTitle: "Thank you for your feedback.",
    distrustfulText:
      "We respect your decision. If you change your mind, our whitepaper is available for review. Transparency is one of our core values.",
    distrustfulCTA: "View Whitepaper",
    carouselTitles: {
      novice: "Start Safely",
      intermediate: "Accelerate Your Earnings",
      advanced: "Tools for Experts",
      distrustful: "Building Trust",
    },
  },
  es: { languageName: "Español" },
  fr: { languageName: "Français" },
  de: { languageName: "Deutsch" },
  ru: { languageName: "Русский" },
  zh: { languageName: "中文" },
}

type LanguageKey = keyof typeof translations

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
}

const VideoPlayer = ({ src, title }: { src?: string; title: string }) => (
  <div className="mt-4">
    <h3 className="text-sm font-medium text-center mb-2">{title}</h3>
    <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
      {src ? (
        <video key={src} controls autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p className="text-slate-500 text-sm">Vídeo (16:9)</p>
      )}
    </div>
  </div>
)

export function FunnelClient({ serverVideos }: { serverVideos: Record<string, string> }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [profile, setProfile] = useState("")
  const [language, setLanguage] = useState<LanguageKey>("pt")
  const [earnedTokens, setEarnedTokens] = useState(0)

  const t = useMemo(() => {
    const base = translations.pt
    const selected = translations[language] || base
    return { ...base, ...selected, credibilityLinks: { ...base.credibilityLinks, ...selected.credibilityLinks } }
  }, [language])

  const progress = useMemo(() => (step / 3) * 100, [step])

  const handleContinue = () => {
    if (step === 0 && name) {
      setEarnedTokens(5)
      setStep(1)
    } else if (step === 1 && email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
      setEarnedTokens(10)
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 2 && profile) {
      const finalTokens = earnedTokens + 15
      setEarnedTokens(finalTokens)
      setStep(3)
      try {
        await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, profile, language, earnedTokens: finalTokens }),
        })
      } catch (error) {
        console.error("Submit error:", error)
      }
    }
  }

  const isNextDisabled = () => {
    if (step === 0 && !name) return true
    if (step === 1 && !email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g)) return true
    if (step === 2 && !profile) return true
    return false
  }

  const currentVideoUrl = serverVideos[`${step}-${language}`]

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <motion.div key="step0" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
            <CardHeader>
              <CardTitle className="text-2xl">{t.welcome}</CardTitle>
              <CardDescription>{t.subWelcome}</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="name">{t.namePrompt}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              <VideoPlayer src={currentVideoUrl} title={t.videoTitle} />
            </CardContent>
            <CardFooter>
              <Button onClick={handleContinue} disabled={isNextDisabled()} className="w-full">
                {t.continue}
              </Button>
            </CardFooter>
          </motion.div>
        )
      case 1:
        return (
          <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
            <CardHeader>
              <CardTitle>{t.emailPrompt.replace("{name}", name)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <VideoPlayer src={currentVideoUrl} title={t.videoTitle} />
            </CardContent>
            <CardFooter>
              <Button onClick={handleContinue} disabled={isNextDisabled()} className="w-full">
                {t.continue}
              </Button>
            </CardFooter>
          </motion.div>
        )
      case 2:
        return (
          <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
            <CardHeader>
              <CardTitle>{t.profilePrompt}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={profile} onValueChange={setProfile} className="space-y-2">
                {Object.entries(t.profileOptions).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key}>{value}</Label>
                  </div>
                ))}
              </RadioGroup>
              <VideoPlayer src={currentVideoUrl} title={t.videoTitle} />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isNextDisabled()} className="w-full">
                {t.continue}
              </Button>
            </CardFooter>
          </motion.div>
        )
      default:
        return null
    }
  }

  if (step === 3) {
    if (profile === "distrustful") {
      return (
        <div className="w-full max-w-2xl mx-auto p-4">
          <motion.div variants={stepVariants} initial="hidden" animate="visible" className="text-center space-y-6">
            <Card className="bg-gray-100 border-gray-200">
              <CardContent className="p-8">
                <ShieldOff className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">{t.distrustfulTitle}</h2>
                <p className="text-muted-foreground mt-2">{t.distrustfulText}</p>
                <Button asChild className="mt-6">
                  <Link href="/whitepaper">{t.distrustfulCTA}</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )
    }

    return (
      <div className="w-full max-w-5xl mx-auto p-4">
        <motion.div variants={stepVariants} initial="hidden" animate="visible" className="w-full text-center space-y-6">
          <Card className="bg-gradient-to-br from-green-50 to-white shadow-lg border-green-200">
            <CardContent className="p-6 sm:p-8">
              <Gift className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold">{t.finalTitle.replace("{name}", name)}</h2>
              <p className="text-xl text-green-700 font-semibold mt-1">
                {t.finalSubtitle.replace("{tokens}", earnedTokens.toString())}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{t.emailReward.replace("{email}", email)}</p>
              <Button asChild className="mt-6">
                <a href="https://www.agroderi.in" target="_blank" rel="noopener noreferrer">
                  {t.buyNow}
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.carouselTitles[profile as keyof typeof t.carouselTitles]}</CardTitle>
            </CardHeader>
            <CardContent>
              <Carousel>
                <CarouselContent>
                  <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-video items-center justify-center p-6 bg-slate-200">
                          <span className="text-2xl font-semibold">Banner 1</span>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-video items-center justify-center p-6 bg-slate-200">
                          <span className="text-2xl font-semibold">Banner 2</span>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-video items-center justify-center p-6 bg-slate-200">
                          <span className="text-2xl font-semibold">Banner 3</span>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
            </CardContent>
          </Card>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="h-full flex flex-col text-left">
              <CardHeader className="flex-row items-center gap-3">
                <Flame className="w-6 h-6 text-orange-500" />
                <CardTitle>{t.upsellTitle}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{t.upsellText}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                  <a href="https://go.hotmart.com/W100675419R" target="_blank" rel="noopener noreferrer">
                    {t.upsellCTA}
                  </a>
                </Button>
              </CardFooter>
            </Card>
            <Card className="h-full flex flex-col text-left bg-blue-50 border-blue-200">
              <CardHeader className="flex-row items-center gap-3">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                <CardTitle>{t.contactTitle}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{t.contactText}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
                  <a href="https://wa.me/message/XSPIGDP7UAD7J1" target="_blank" rel="noopener noreferrer">
                    {t.contactCTA}
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className="text-left">
            <CardHeader>
              <CardTitle>{t.credibilityTitle}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="justify-start gap-2 bg-transparent">
                <Link href="/whitepaper" target="_blank" rel="noopener noreferrer">
                  <BookOpen size={16} /> {t.credibilityLinks.whitepaper}
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2 bg-transparent">
                <a href="https://akintec.com" target="_blank" rel="noopener noreferrer">
                  <Building size={16} /> {t.credibilityLinks.akintec}
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2 bg-transparent">
                <a href="https://agroderi.com" target="_blank" rel="noopener noreferrer">
                  <Building size={16} /> {t.credibilityLinks.agroderi}
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2 bg-transparent">
                <a href="/investors" target="_blank" rel="noopener noreferrer">
                  <Users size={16} /> {t.credibilityLinks.investors}
                </a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="flex-row justify-between items-center">
            <div className="w-full mr-4">
              <Progress value={progress} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="flex-shrink-0 bg-transparent">
                  <Languages className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.keys(translations)
                  .filter((key) => translations[key as LanguageKey].languageName)
                  .map((lang) => (
                    <DropdownMenuItem key={lang} onSelect={() => setLanguage(lang as LanguageKey)}>
                      {translations[lang as LanguageKey].languageName}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
          <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm font-bold text-green-600">
              <Coins size={16} />
              <span>
                {t.tokensEarned}: {earnedTokens} AGD
              </span>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
