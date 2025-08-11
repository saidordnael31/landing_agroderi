// Regras de Negócio do Sistema AGD Token

export interface InvestmentPlan {
  id: string
  name: string
  monthlyValue: number
  minCommitmentMonths: number
  bonusPercent: number
  affiliateBonusPercent: number
  lockPeriod: number // dias
  description: string
  features: string[]
  trafficAllocation: number // % do valor destinado ao tráfego
  tokensPerReal: number // quantos tokens por real investido
}

// Planos de Investimento Mensais - Tokens + Tráfego Pago
export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyValue: 1500,
    minCommitmentMonths: 4,
    bonusPercent: 10, // 10% de bônus em tokens
    affiliateBonusPercent: 10, // 10% de comissão para afiliados
    lockPeriod: 30,
    description: "Plano inicial com tokens e tráfego pago",
    features: [
      "R$ 1.500/mês por 4 meses",
      "1.650 AGD Tokens/mês (com 10% bônus)",
      "R$ 1.500/mês em tráfego pago",
      "~1.000 cliques/mês estimados",
      "Dashboard de performance",
      "Suporte completo",
      "Otimização automática de campanhas",
    ],
    trafficAllocation: 1.0, // 100% do valor também para tráfego
    tokensPerReal: 1, // 1 token por real + bônus
  },
  {
    id: "professional",
    name: "Professional",
    monthlyValue: 3000,
    minCommitmentMonths: 4,
    bonusPercent: 15, // 15% de bônus em tokens
    affiliateBonusPercent: 12,
    lockPeriod: 30,
    description: "Para quem quer escalar com tokens e tráfego",
    features: [
      "R$ 3.000/mês por 4 meses",
      "3.450 AGD Tokens/mês (com 15% bônus)",
      "R$ 3.000/mês em tráfego pago",
      "~2.000 cliques/mês estimados",
      "Campanhas em múltiplas plataformas",
      "Otimização avançada",
      "Suporte prioritário",
      "Relatórios executivos",
    ],
    trafficAllocation: 1.0,
    tokensPerReal: 1,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyValue: 5000,
    minCommitmentMonths: 4,
    bonusPercent: 20, // 20% de bônus em tokens
    affiliateBonusPercent: 15,
    lockPeriod: 30,
    description: "Máximo volume de tokens e tráfego",
    features: [
      "R$ 5.000/mês por 4 meses",
      "6.000 AGD Tokens/mês (com 20% bônus)",
      "R$ 5.000/mês em tráfego pago",
      "~3.333 cliques/mês estimados",
      "Campanhas premium otimizadas",
      "Múltiplas plataformas simultâneas",
      "Suporte VIP 24/7",
      "Consultoria estratégica semanal",
      "Gerente de conta dedicado",
    ],
    trafficAllocation: 1.0,
    tokensPerReal: 1,
  },
  {
    id: "elite",
    name: "Elite",
    monthlyValue: 10000,
    minCommitmentMonths: 4,
    bonusPercent: 25, // 25% de bônus em tokens
    affiliateBonusPercent: 20,
    lockPeriod: 30,
    description: "Para grandes escalas de tokens e tráfego",
    features: [
      "R$ 10.000/mês por 4 meses",
      "12.500 AGD Tokens/mês (com 25% bônus)",
      "R$ 10.000/mês em tráfego pago",
      "~6.667 cliques/mês estimados",
      "Campanhas enterprise premium",
      "Todas as plataformas disponíveis",
      "Otimização com IA avançada",
      "Suporte VIP exclusivo",
      "Consultoria estratégica diária",
      "Equipe dedicada exclusiva",
    ],
    trafficAllocation: 1.0,
    tokensPerReal: 1,
  },
]

// Configurações de tráfego
export const TRAFFIC_CONFIG = {
  costPerClick: 1.5, // R$ 1,50 por clique
  conversionRate: 0.02, // 2% de conversão
  averageCommission: 150, // R$ 150 por conversão
}

// Configurações de tokens
export const TOKEN_CONFIG = {
  currentPrice: 1.0, // R$ 1,00 por token
  monthlyGrowth: 0.05, // 5% ao mês
  lockPeriod: 30, // 30 dias
}

// Regras de Comissão para Afiliados
export const BUSINESS_RULES = {
  COMMISSION: {
    starter: 0.1, // 10%
    professional: 0.12, // 12%
    enterprise: 0.15, // 15%
    elite: 0.2, // 20%
  },
}

// Funções utilitárias
export function calculateMonthlyCommitment(planId: string): {
  monthlyValue: number
  totalValue: number
  totalTokens: number
  monthlyTokens: number
  monthlyTrafficBudget: number
  totalTrafficBudget: number
} | null {
  const plan = INVESTMENT_PLANS.find((p) => p.id === planId)
  if (!plan) return null

  const totalValue = plan.monthlyValue * plan.minCommitmentMonths
  const monthlyTokens = plan.monthlyValue * plan.tokensPerReal * (1 + plan.bonusPercent / 100)
  const totalTokens = monthlyTokens * plan.minCommitmentMonths
  const monthlyTrafficBudget = plan.monthlyValue * plan.trafficAllocation
  const totalTrafficBudget = monthlyTrafficBudget * plan.minCommitmentMonths

  return {
    monthlyValue: plan.monthlyValue,
    totalValue,
    totalTokens,
    monthlyTokens,
    monthlyTrafficBudget,
    totalTrafficBudget,
  }
}

// Calcular resultados esperados de tráfego
export function calculateExpectedTrafficResults(monthlyBudget: number) {
  const estimatedClicks = Math.floor(monthlyBudget / TRAFFIC_CONFIG.costPerClick)
  const estimatedImpressions = estimatedClicks * 40 // 1 clique para cada 40 impressões
  const estimatedConversions = Math.floor(estimatedClicks * TRAFFIC_CONFIG.conversionRate)
  const estimatedCommissions = estimatedConversions * TRAFFIC_CONFIG.averageCommission

  return {
    estimatedClicks,
    estimatedImpressions,
    estimatedConversions,
    estimatedCommissions,
  }
}

// Calcular valor e projeção dos tokens
export function calculateTokenValue(totalTokens: number) {
  const currentValue = totalTokens * TOKEN_CONFIG.currentPrice

  // Projeção de 12 meses com crescimento mensal
  const projectedValue12Months = totalTokens * TOKEN_CONFIG.currentPrice * Math.pow(1 + TOKEN_CONFIG.monthlyGrowth, 12)

  // Projeção de 24 meses
  const projectedValue24Months = totalTokens * TOKEN_CONFIG.currentPrice * Math.pow(1 + TOKEN_CONFIG.monthlyGrowth, 24)

  return {
    currentValue: Math.round(currentValue),
    projectedValue12Months: Math.round(projectedValue12Months),
    projectedValue24Months: Math.round(projectedValue24Months),
    monthlyGrowth: TOKEN_CONFIG.monthlyGrowth,
    lockPeriod: TOKEN_CONFIG.lockPeriod,
  }
}

// Calcular ROI combinado (tokens + tráfego)
export function calculateCombinedROI(planType: string, months = 12) {
  const plan = INVESTMENT_PLANS.find((p) => p.id === planType)
  if (!plan) return null

  // Investimento total em 4 meses
  const totalInvestment = plan.monthlyValue * 4

  // Valor dos tokens após o período
  const planDetails = calculateMonthlyCommitment(planType)
  if (!planDetails) return null

  const tokenValue = calculateTokenValue(planDetails.totalTokens)

  // Comissões estimadas do tráfego em 4 meses
  const trafficResults = calculateExpectedTrafficResults(plan.monthlyValue)
  const totalCommissions = trafficResults.estimatedCommissions * 4

  // ROI total
  const totalReturn = tokenValue.projectedValue12Months + totalCommissions
  const roi = ((totalReturn - totalInvestment) / totalInvestment) * 100

  return {
    totalInvestment,
    tokenValue: tokenValue.projectedValue12Months,
    trafficCommissions: totalCommissions,
    totalReturn,
    roi: Math.round(roi),
  }
}

export function getCommissionRate(tier: string): number {
  switch (tier.toLowerCase()) {
    case "elite":
      return BUSINESS_RULES.COMMISSION.elite
    case "enterprise":
      return BUSINESS_RULES.COMMISSION.enterprise
    case "professional":
      return BUSINESS_RULES.COMMISSION.professional
    case "starter":
      return BUSINESS_RULES.COMMISSION.starter
    default:
      return BUSINESS_RULES.COMMISSION.starter
  }
}

// Gerar código de afiliado único
export function generateAffiliateCode(name: string): string {
  const cleanName = name
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 3)
  const timestamp = Date.now().toString().slice(-4)
  const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase()
  return `${cleanName}${timestamp}${randomSuffix}`
}

// Calcular métricas de dashboard
export function calculateDashboardMetrics(commitments: any[], clicks: any[], sales: any[]) {
  const totalInvested = commitments.reduce((sum, c) => sum + c.monthly_commitment * c.commitment_months, 0)
  const totalTokens = commitments.reduce((sum, c) => sum + c.monthly_tokens * c.commitment_months, 0)
  const totalClicks = clicks.length
  const totalSales = sales.length
  const totalCommissions = sales.reduce((sum, s) => sum + s.commission_amount, 0)

  const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0
  const averageCommission = totalSales > 0 ? totalCommissions / totalSales : 0

  return {
    totalInvested,
    totalTokens,
    totalClicks,
    totalSales,
    totalCommissions,
    conversionRate: Math.round(conversionRate * 100) / 100,
    averageCommission: Math.round(averageCommission),
    tokenValue: calculateTokenValue(totalTokens),
  }
}

// Gerar dados para planilhas
export function generateSheetsData(affiliates: any[], sales: any[], clicks: any[]) {
  return affiliates.map((affiliate) => ({
    id: affiliate.id,
    name: affiliate.name,
    email: affiliate.email,
    code: affiliate.affiliate_code,
    totalSales: sales.filter((s) => s.affiliate_id === affiliate.id).length,
    totalClicks: clicks.filter((c) => c.affiliate_id === affiliate.id).length,
    totalCommissions: sales
      .filter((s) => s.affiliate_id === affiliate.id)
      .reduce((sum, s) => sum + s.commission_amount, 0),
    conversionRate:
      clicks.filter((c) => c.affiliate_id === affiliate.id).length > 0
        ? (sales.filter((s) => s.affiliate_id === affiliate.id).length /
            clicks.filter((c) => c.affiliate_id === affiliate.id).length) *
          100
        : 0,
  }))
}

export function calculateWithdrawalAmount(tokens: number, lockDate: Date): number {
  const now = new Date()
  const lockPeriodEnd = new Date(lockDate.getTime() + TOKEN_CONFIG.lockPeriod * 24 * 60 * 60 * 1000)

  if (now < lockPeriodEnd) {
    return 0 // Tokens ainda estão em lock
  }

  return tokens * TOKEN_CONFIG.currentPrice
}

export function canWithdraw(lockDate: Date): boolean {
  const now = new Date()
  const lockPeriodEnd = new Date(lockDate.getTime() + TOKEN_CONFIG.lockPeriod * 24 * 60 * 60 * 1000)
  return now >= lockPeriodEnd
}

export function canBecomeAffiliate(userInvestment: number): boolean {
  // Usuário pode se tornar afiliado se tiver investimento mínimo do plano starter
  return userInvestment >= INVESTMENT_PLANS[0].monthlyValue
}

export function getTierByInvestment(monthlyInvestment: number): string {
  if (monthlyInvestment >= 10000) return "elite"
  if (monthlyInvestment >= 5000) return "enterprise"
  if (monthlyInvestment >= 3000) return "professional"
  return "starter"
}

export function calculateInvestmentBonus(baseAmount: number, planId: string): number {
  const plan = INVESTMENT_PLANS.find((p) => p.id === planId)
  if (!plan) return baseAmount

  return baseAmount * (1 + plan.bonusPercent / 100)
}
