// Regras de Negócio do Sistema AGD

export interface InvestmentPlan {
  id: string
  name: string
  minValue: number
  maxValue: number | null
  bonusPercent: number
  affiliateBonusPercent: number
  lockPeriod: number // dias
  description: string
  features: string[]
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  cpf: string
  role: "admin" | "viewer" | "buyer" | "affiliate"
  status: "active" | "pending" | "blocked"
  createdAt: string
  lastLogin?: string
}

export interface Investment {
  id: string
  userId: string
  planId: string
  amount: number
  bonus: number
  affiliateBonus: number
  affiliateId?: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  purchaseDate: string
  unlockDate: string
  withdrawalRequested?: boolean
  withdrawalDate?: string
  paymentMethod: string
  transactionId?: string
}

export interface AffiliateCommission {
  id: string
  affiliateId: string
  investmentId: string
  amount: number
  percentage: number
  status: "pending" | "paid" | "cancelled"
  generatedAt: string
  paidAt?: string
  paymentMethod?: string
}

// Planos de Investimento
export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: "starter",
    name: "Plano Iniciante",
    minValue: 50,
    maxValue: 999,
    bonusPercent: 5,
    affiliateBonusPercent: 2,
    lockPeriod: 30,
    description: "Ideal para quem está começando",
    features: ["Entrada acessível", "Bônus de 5%", "Suporte completo", "Resgate em 30 dias"],
  },
  {
    id: "intermediate",
    name: "Plano Intermediário",
    minValue: 1000,
    maxValue: 4999,
    bonusPercent: 15,
    affiliateBonusPercent: 3,
    lockPeriod: 60,
    description: "Melhor custo-benefício",
    features: ["Bônus de 15%", "Prioridade no suporte", "Relatórios exclusivos", "Resgate em 60 dias"],
  },
  {
    id: "premium",
    name: "Plano Premium",
    minValue: 5000,
    maxValue: null,
    bonusPercent: 25,
    affiliateBonusPercent: 5,
    lockPeriod: 90,
    description: "Máximo retorno para grandes investidores",
    features: ["Bônus de 25%", "Acesso VIP", "Consultoria personalizada", "Resgate em 90 dias"],
  },
]

// Regras de Comissão para Afiliados (atualizadas conforme documento)
export const AFFILIATE_COMMISSION_RULES = {
  // Comissão direta para o vendedor
  directCommission: 7, // 7% para o vendedor que realizar a conversão direta

  // Comissão de liderança
  leadershipCommission: 3, // 3% para o líder que indicou o afiliado

  // Período de atribuição
  attributionPeriod: 48, // 48 horas para atribuição de conversão

  // Valor mínimo para saque
  minWithdrawal: 50, // US$ 50 mínimo

  // Moeda de pagamento
  paymentCurrency: "USDT",

  // Frequência de pagamento
  paymentFrequency: "weekly", // Pagamentos semanais às sextas-feiras

  // ROAS esperado
  expectedROAS: 2.8,
}

// Regras de Resgate
export const WITHDRAWAL_RULES = {
  // Período mínimo de lock por plano
  lockPeriods: {
    starter: 30,
    intermediate: 60,
    premium: 90,
  },

  // Taxa de resgate antecipado
  earlyWithdrawalFee: 10, // 10% de penalidade

  // Prazo para processamento
  processingDays: 5,

  // Valor mínimo para resgate
  minWithdrawal: 50,
}

// Funções utilitárias
export function calculateInvestmentBonus(
  planId: string,
  amount: number,
  hasAffiliate = false,
): {
  totalAmount: number
  bonus: number
  affiliateBonus: number
} {
  const plan = INVESTMENT_PLANS.find((p) => p.id === planId)
  if (!plan) throw new Error("Plano não encontrado")

  const bonus = (amount * plan.bonusPercent) / 100
  const affiliateBonus = hasAffiliate ? (amount * plan.affiliateBonusPercent) / 100 : 0

  return {
    totalAmount: amount + bonus + affiliateBonus,
    bonus,
    affiliateBonus,
  }
}

// Atualizar função de cálculo de comissão
export function calculateAffiliateCommission(
  amount: number,
  isDirectSale = true,
  hasLeader = false,
): {
  directCommission: number
  leadershipCommission: number
  totalCommission: number
} {
  const directCommission = isDirectSale ? (amount * AFFILIATE_COMMISSION_RULES.directCommission) / 100 : 0
  const leadershipCommission = hasLeader ? (amount * AFFILIATE_COMMISSION_RULES.leadershipCommission) / 100 : 0

  return {
    directCommission,
    leadershipCommission,
    totalCommission: directCommission + leadershipCommission,
  }
}

export function canWithdraw(investment: Investment): boolean {
  const plan = INVESTMENT_PLANS.find((p) => p.id === investment.planId)
  if (!plan) return false

  const unlockDate = new Date(investment.unlockDate)
  const now = new Date()

  return now >= unlockDate && investment.status === "confirmed"
}

export function calculateWithdrawalAmount(investment: Investment, isEarly = false): number {
  let amount = investment.amount + investment.bonus + investment.affiliateBonus

  if (isEarly) {
    const fee = (amount * WITHDRAWAL_RULES.earlyWithdrawalFee) / 100
    amount -= fee
  }

  return Math.max(amount, 0)
}

// Função para gerar relatório para Google Sheets
export function generateSheetsData(investments: Investment[], commissions: AffiliateCommission[]) {
  return {
    investments: investments.map((inv) => ({
      id: inv.id,
      userId: inv.userId,
      planId: inv.planId,
      amount: inv.amount,
      bonus: inv.bonus,
      affiliateBonus: inv.affiliateBonus,
      totalAmount: inv.amount + inv.bonus + inv.affiliateBonus,
      status: inv.status,
      purchaseDate: inv.purchaseDate,
      unlockDate: inv.unlockDate,
      canWithdraw: canWithdraw(inv),
    })),
    commissions: commissions.map((comm) => ({
      id: comm.id,
      affiliateId: comm.affiliateId,
      investmentId: comm.investmentId,
      amount: comm.amount,
      percentage: comm.percentage,
      status: comm.status,
      generatedAt: comm.generatedAt,
      paidAt: comm.paidAt,
    })),
  }
}

// Regras de conduta para afiliados
export const AFFILIATE_CONDUCT_RULES = {
  prohibited: [
    "Prometer retorno financeiro garantido",
    "Utilizar linguagem que viole regulamentações da CVM",
    "Spam ou práticas enganosas",
    "Fake news ou informações falsas",
    "Materiais não aprovados",
  ],
  required: [
    "Utilizar apenas materiais aprovados",
    "Respeitar branding do AGD",
    "Seguir diretrizes de comunicação",
    "Manter práticas éticas",
  ],
  penalties: [
    "Advertência por primeira violação",
    "Suspensão temporária por reincidência",
    "Expulsão e suspensão de pagamentos por violações graves",
  ],
}
