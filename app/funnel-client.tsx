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
import {
  Gift,
  Languages,
  ShieldOff,
  Coins,
  Flame,
  MessageSquare,
  BookOpen,
  Building,
  Users,
  ShieldCheck,
  GitBranch,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Share2, VoteIcon } from "lucide-react" // Adicione VoteIcon ao import

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
  es: {
    welcome: "¡Tu viaje de valor comienza ahora!",
    subWelcome:
      "Cada paso aquí te genera recompensas en tokens AGD. En 3 meses, puedes retirar o reinvertir para ver crecer tu patrimonio.",
    namePrompt: "¿Cuál es tu nombre?",
    emailPrompt: "{name}, ¿cuál es tu mejor correo electrónico?",
    profilePrompt: "Tu nivel de experiencia con cripto:",
    profileOptions: {
      novice: "Principiante",
      intermediate: "Intermedio",
      advanced: "Avanzado",
      distrustful: "No confío / No quiero volver a ver esto",
    },
    continue: "Continuar",
    finalTitle: "¡Felicitaciones, {name}!",
    finalSubtitle: "¡Has acumulado {tokens} tokens AGD!",
    finalValue: "Valor equivalente: ${value}",
    affiliateCTA: "Sé Afiliado",
    rewardUnlocked: "¡Recompensa desbloqueada!",
    buyNow: "Comprar AGD",
    emailReward: "Enviamos las instrucciones a {email}",
    upsellTitle: "Potencia Tus Ganancias",
    upsellText: "Adquiere nuestro curso Web3 y gana +100 tokens AGD.",
    upsellCTA: "Quiero el Bono",
    downsellTitle: "Sigue de Cerca",
    downsellText: "Únete a nuestro grupo exclusivo de WhatsApp.",
    downsellCTA: "Unirse al Grupo",
    languageName: "Español",
    videoTitle: "Entiende el Proyecto en 1 Minuto",
    credibilityTitle: "Nuestra Credibilidad",
    credibilityLinks: {
      whitepaper: "Whitepaper y Tokenomics",
      akintec: "Conoce Akintec",
      agroderi: "Conoce Agroderi",
      investors: "Inversores: Google y Nubank",
    },
    contactTitle: "Habla con un Especialista",
    contactText: "Resuelve tus dudas o programa una reunión.",
    contactCTA: "Chatear en WhatsApp",
    tokensEarned: "Tokens Ganados",
    distrustfulTitle: "Agradecemos tus comentarios.",
    distrustfulText:
      "Respetamos tu decisión. Si cambias de opinión, nuestro whitepaper está disponible para consulta. La transparencia es uno de nuestros mayores valores.",
    distrustfulCTA: "Ver Whitepaper",
    carouselTitles: {
      novice: "Comienza con Seguridad",
      intermediate: "Acelera tus Ganancias",
      advanced: "Herramientas para Expertos",
      distrustful: "Construyendo Confianza",
    },
  },
  fr: {
    languageName: "Français",
    welcome: "Votre parcours de valeur commence maintenant !",
    subWelcome:
      "Chaque étape ici vous rapporte des récompenses en jetons AGD. Dans 3 mois, vous pourrez retirer ou réinvestir pour voir votre patrimoine grandir.",
    namePrompt: "Quel est votre nom ?",
    emailPrompt: "{name}, quelle est votre meilleure adresse e-mail ?",
    profilePrompt: "Votre niveau d'expérience en crypto :",
    profileOptions: { novice: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé", distrustful: "Méfiant" },
    continue: "Continuer",
    finalTitle: "Félicitations, {name} !",
    finalSubtitle: "Vous avez gagné {tokens} jetons AGD !",
    finalValue: "Valeur équivalente : ${value}",
    affiliateCTA: "Devenir affilié",
    rewardUnlocked: "Récompense débloquée !",
    buyNow: "Acheter AGD",
    emailReward: "Nous avons envoyé les instructions à {email}",
    upsellTitle: "Augmentez vos gains",
    upsellText: "Achetez notre cours Web3 et obtenez +100 jetons AGD.",
    upsellCTA: "Obtenir le bonus",
    downsellTitle: "Suivez de près",
    downsellText: "Rejoignez notre groupe WhatsApp exclusif.",
    downsellCTA: "Rejoindre le groupe",
    crosssellTitle: "Vendez avec nous",
    crosssellText: "Gagnez jusqu'à 40% de commission en tant qu'affilié.",
    videoTitle: "Comprendre le projet en 1 minute",
    credibilityTitle: "Nos références",
    credibilityLinks: {
      whitepaper: "Livre blanc & Tokenomics",
      akintec: "Découvrir Akintec",
      agroderi: "Découvrir Agroderi",
      investors: "Investisseurs : Google & Nubank",
    },
    contactTitle: "Parler à un spécialiste",
    contactText: "Posez des questions ou planifiez une réunion.",
    contactCTA: "Discuter sur WhatsApp",
    tokensEarned: "Jetons gagnés",
    distrustfulTitle: "Merci pour vos commentaires.",
    distrustfulText:
      "Nous respectons votre décision. Si vous changez d'avis, notre livre blanc est disponible pour consultation. La transparence est l'une de nos valeurs fondamentales.",
    distrustfulCTA: "Voir le livre blanc",
    carouselTitles: {
      novice: "Commencez en toute sécurité",
      intermediate: "Accélérez vos gains",
      advanced: "Outils pour experts",
      distrustful: "Bâtir la confiance",
    },
  },
  de: {
    languageName: "Deutsch",
    welcome: "Ihre Wert-Reise beginnt jetzt!",
    subWelcome:
      "Jeder Schritt hier bringt Ihnen Belohnungen in AGD-Token. In 3 Monaten können Sie abheben oder reinvestieren, um Ihr Vermögen wachsen zu sehen.",
    namePrompt: "Wie ist Ihr Name?",
    emailPrompt: "{name}, was ist Ihre beste E-Mail-Adresse?",
    profilePrompt: "Ihr Erfahrungslevel mit Krypto:",
    profileOptions: {
      novice: "Anfänger",
      intermediate: "Fortgeschritten",
      advanced: "Experte",
      distrustful: "Misstrauisch",
    },
    continue: "Weiter",
    finalTitle: "Herzlichen Glückwunsch, {name}!",
    finalSubtitle: "Sie haben {tokens} AGD-Token verdient!",
    finalValue: "Gegenwert: ${value}",
    affiliateCTA: "Partner werden",
    rewardUnlocked: "Belohnung freigeschaltet!",
    buyNow: "AGD kaufen",
    emailReward: "Wir haben die Anweisungen an {email} gesendet",
    upsellTitle: "Steigern Sie Ihre Einnahmen",
    upsellText: "Kaufen Sie unseren Web3-Kurs und erhalten Sie +100 AGD-Token.",
    upsellCTA: "Bonus erhalten",
    downsellTitle: "Bleiben Sie auf dem Laufenden",
    downsellText: "Treten Sie unserer exklusiven WhatsApp-Gruppe bei.",
    downsellCTA: "Gruppe beitreten",
    crosssellTitle: "Verkaufen Sie mit uns",
    crosssellText: "Verdienen Sie bis zu 40% Provision als Partner.",
    videoTitle: "Das Projekt in 1 Minute verstehen",
    credibilityTitle: "Unsere Referenzen",
    credibilityLinks: {
      whitepaper: "Whitepaper & Tokenomics",
      akintec: "Lernen Sie Akintec kennen",
      agroderi: "Lernen Sie Agroderi kennen",
      investors: "Investoren: Google & Nubank",
    },
    contactTitle: "Sprechen Sie mit einem Spezialisten",
    contactText: "Stellen Sie Fragen oder vereinbaren Sie ein Treffen.",
    contactCTA: "Auf WhatsApp chatten",
    tokensEarned: "Verdiente Token",
    distrustfulTitle: "Vielen Dank für Ihr Feedback.",
    distrustfulText:
      "Wir respektieren Ihre Entscheidung. Wenn Sie Ihre Meinung ändern, steht unser Whitepaper zur Verfügung. Transparenz ist einer unserer Grundwerte.",
    distrustfulCTA: "Whitepaper ansehen",
    carouselTitles: {
      novice: "Sicher starten",
      intermediate: "Beschleunigen Sie Ihre Einnahmen",
      advanced: "Werkzeuge für Experten",
      distrustful: "Vertrauen aufbauen",
    },
  },
  ru: {
    languageName: "Русский",
    welcome: "Ваше путешествие к ценности начинается сейчас!",
    subWelcome:
      "Каждый шаг здесь приносит вам вознаграждения в токенах AGD. Через 3 месяца вы сможете вывести средства или реинвестировать, чтобы наблюдать за ростом вашего состояния.",
    namePrompt: "Как вас зовут?",
    emailPrompt: "{name}, какой ваш лучший адрес электронной почты?",
    profilePrompt: "Ваш уровень опыта в крипто:",
    profileOptions: {
      novice: "Новичок",
      intermediate: "Средний",
      advanced: "Продвинутый",
      distrustful: "Недоверчивый",
    },
    continue: "Продолжить",
    finalTitle: "Поздравляем, {name}!",
    finalSubtitle: "Вы заработали {tokens} токенов AGD!",
    finalValue: "Эквивалентная стоимость: ${value}",
    affiliateCTA: "Стать партнером",
    rewardUnlocked: "Награда разблокирована!",
    buyNow: "Купить AGD",
    emailReward: "Мы отправили инструкции на {email}",
    upsellTitle: "Увеличьте свой доход",
    upsellText: "Купите наш курс по Web3 и получите +100 токенов AGD.",
    upsellCTA: "Получить бонус",
    downsellTitle: "Следите внимательно",
    downsellText: "Присоединяйтесь к нашей эксклюзивной группе в WhatsApp.",
    downsellCTA: "Присоединиться к группе",
    crosssellTitle: "Продавайте с нами",
    crosssellText: "Зарабатывайте до 40% комиссии в качестве партнера.",
    videoTitle: "Понять проект за 1 минуту",
    credibilityTitle: "Наше доверие",
    credibilityLinks: {
      whitepaper: "Whitepaper и Токеномика",
      akintec: "Знакомьтесь, Akintec",
      agroderi: "Знакомьтесь, Agroderi",
      investors: "Инвесторы: Google и Nubank",
    },
    contactTitle: "Поговорите со специалистом",
    contactText: "Задайте вопросы или назначьте встречу.",
    contactCTA: "Чат в WhatsApp",
    tokensEarned: "Заработанные токены",
    distrustfulTitle: "Спасибо за ваш отзыв.",
    distrustfulText:
      "Мы уважаем ваше решение. Если вы передумаете, наш whitepaper доступен для ознакомления. Прозрачность — одна из наших основных ценностей.",
    distrustfulCTA: "Посмотреть Whitepaper",
    carouselTitles: {
      novice: "Начните безопасно",
      intermediate: "Ускорьте свой заработок",
      advanced: "Инструменты для экспертов",
      distrustful: "Построение доверия",
    },
  },
  zh: {
    languageName: "中文",
    welcome: "您的价值之旅现在开始！",
    subWelcome: "在这里的每一步都会为您赢得AGD代币奖励。3个月后，您可以提取或再投资，以观察您的资产增长。",
    namePrompt: "您叫什么名字？",
    emailPrompt: "{name}，您最好的电子邮件是什么？",
    profilePrompt: "您的加密货币经验水平：",
    profileOptions: { novice: "初学者", intermediate: "中级", advanced: "高级", distrustful: "不信任" },
    continue: "继续",
    finalTitle: "恭喜，{name}！",
    finalSubtitle: "您已经获得了 {tokens} 个AGD代币！",
    finalValue: "等值价值：${value}",
    affiliateCTA: "成为会员",
    rewardUnlocked: "奖励已解锁！",
    buyNow: "购买AGD",
    emailReward: "我们已将说明发送至 {email}",
    upsellTitle: "增加您的收入",
    upsellText: "购买我们的Web3课程，即可获得+100个AGD代币。",
    upsellCTA: "获取奖励",
    downsellTitle: "密切关注",
    downsellText: "加入我们的专属WhatsApp群组。",
    downsellCTA: "加入群组",
    crosssellTitle: "与我们一起销售",
    crosssellText: "作为会员，赚取高达40%的佣金。",
    videoTitle: "1分钟了解项目",
    credibilityTitle: "我们的信誉",
    credibilityLinks: {
      whitepaper: "白皮书和代币经济学",
      akintec: "了解Akintec",
      agroderi: "了解Agroderi",
      investors: "投资者：谷歌和Nubank",
    },
    contactTitle: "与专家交谈",
    contactText: "提出问题或安排会议。",
    contactCTA: "在WhatsApp上聊天",
    tokensEarned: "赚取的代币",
    distrustfulTitle: "感谢您的反馈。",
    distrustfulText: "我们尊重您的决定。如果您改变主意，我们的白皮书可供查阅。透明度是我们的核心价值观之一。",
    distrustfulCTA: "查看白皮书",
    carouselTitles: { novice: "安全入门", intermediate: "加速您的收益", advanced: "专家工具", distrustful: "建立信任" },
  },
}

const banners = {
  novice: [
    {
      icon: BookOpen,
      title: "Guia do Iniciante",
      description: "Aprenda os conceitos básicos de cripto e Web3 de forma segura.",
      cta: "Começar a Aprender",
    },
    {
      icon: ShieldCheck,
      title: "Segurança em Primeiro Lugar",
      description: "Descubra como proteger seus ativos digitais contra fraudes.",
      cta: "Ver Dicas de Segurança",
    },
    {
      icon: Users,
      title: "Comunidade de Apoio",
      description: "Junte-se a outros iniciantes e tire suas dúvidas em nosso grupo.",
      cta: "Entrar na Comunidade",
    },
  ],
  intermediate: [
    {
      icon: Share2,
      title: "Seja Afiliado",
      description: "Indique novos usuários para a plataforma e ganhe até 40% de comissão.",
      cta: "Quero ser Afiliado",
    },
    {
      icon: VoteIcon,
      title: "Seja Sócio",
      description: "Participe da nossa DAO, vote em propostas e ajude a decidir o futuro do projeto.",
      cta: "Entrar na DAO",
    },
    {
      icon: Coins,
      title: "Ganhe Mais Tokens",
      description: "Complete tarefas na comunidade, participe de eventos e acumule mais AGD.",
      cta: "Ver Tarefas",
    },
  ],
  advanced: [
    {
      icon: Flame,
      title: "Staking & Farming",
      description: "Maximize seus rendimentos com nossos pools de liquidez e staking de AGD.",
      cta: "Acessar Pools",
    },
    {
      icon: GitBranch,
      title: "Derivativos Descentralizados",
      description: "Opere contratos futuros e opções de commodities agrícolas tokenizadas.",
      cta: "Ir para o Mercado",
    },
    {
      icon: Building,
      title: "Tokenização de Ativos",
      description: "Traga seus próprios ativos do agronegócio para o ecossistema Agroderi.",
      cta: "Fale com um Especialista",
    },
  ],
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
              <CardTitle>
                {t.carouselTitles[profile as keyof typeof t.carouselTitles] || t.carouselTitles.novice}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Carousel>
                <CarouselContent>
                  {(banners[profile as keyof typeof banners] || banners.novice).map((banner, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-1 h-full">
                        <Card className="flex flex-col h-full text-left">
                          <CardHeader className="flex-row items-center gap-3 pb-2">
                            <banner.icon className="w-6 h-6 text-green-600" />
                            <CardTitle className="text-base">{banner.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground">{banner.description}</p>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              {banner.cta}
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
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
