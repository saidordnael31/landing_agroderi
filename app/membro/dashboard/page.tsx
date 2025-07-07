"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle, Download, Calendar, Wallet } from "lucide-react"
import { INVESTMENT_PLANS, calculateWithdrawalAmount, canWithdraw } from "@/lib/business-rules"

export default function DashboardMembro() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [investments, setInvestments] = useState([])
  const [selectedInvestment, setSelectedInvestment] = useState(null)

  useEffect(() => {
    const currentUser = localStorage.getItem("current_user")
    if (!currentUser) {
      router.push("/membro/login")
      return
    }

    const user = JSON.parse(currentUser)
    if (user.role !== "buyer") {
      router.push("/membro/login")
      return
    }

    setUserData(user)

    // Dados demo de investimentos
    const demoInvestments = [
      {
        id: "INV001",
        userId: user.email,
        planId: "intermediate",
        amount: 2000,
        bonus: 300,
        affiliateBonus: 60,
        affiliateId: "AGD123456",
        status: "confirmed",
        purchaseDate: "2024-01-10T10:00:00Z",
        unlockDate: "2024-03-10T10:00:00Z",
        paymentMethod: "PIX",
        transactionId: "TXN001",
      },
      {
        id: "INV002",
        userId: user.email,
        planId: "starter",
        amount: 500,
        bonus: 25,
        affiliateBonus: 0,
        status: "confirmed",
        purchaseDate: "2024-01-15T14:30:00Z",
        unlockDate: "2024-02-14T14:30:00Z",
        paymentMethod: "PIX",
        transactionId: "TXN002",
      },
      {
        id: "INV003",
        userId: user.email,
        planId: "premium",
        amount: 8000,
        bonus: 2000,
        affiliateBonus: 400,
        affiliateId: "AGD789012",
        status: "pending",
        purchaseDate: "2024-01-20T09:15:00Z",
        unlockDate: "2024-04-20T09:15:00Z",
        paymentMethod: "PIX",
        transactionId: "TXN003",
      },
    ]

    setInvestments(demoInvestments)
  }, [router])

  const handleWithdrawalRequest = (investmentId) => {
    setInvestments((prev) =>
      prev.map((inv) =>
        inv.id === investmentId ? { ...inv, withdrawalRequested: true, withdrawalDate: new Date().toISOString() } : inv,
      ),
    )

    // Aqui você enviaria para a API
    alert("Solicitação de resgate enviada! Processamento em até 5 dias úteis.")
  }

  const handleLogout = () => {
    localStorage.removeItem("current_user")
    router.push("/membro/login")
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalBonus = investments.reduce((sum, inv) => sum + inv.bonus + inv.affiliateBonus, 0)
  const totalValue = totalInvested + totalBonus
  const confirmedInvestments = investments.filter((inv) => inv.status === "confirmed")
  const availableForWithdrawal = confirmedInvestments.filter((inv) => canWithdraw(inv))

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-zinc-800">Minha Carteira AGD</h1>
              <p className="text-zinc-600">Olá, {userData.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-green-500 text-green-700">
                Membro Ativo
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Resumo Financeiro */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-zinc-600">Total Investido</p>
                  <p className="text-2xl font-bold">R$ {totalInvested.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-zinc-600">Total em Bônus</p>
                  <p className="text-2xl font-bold">R$ {totalBonus.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Wallet className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-zinc-600">Valor Total</p>
                  <p className="text-2xl font-bold">R$ {totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-zinc-600">Disponível</p>
                  <p className="text-2xl font-bold">{availableForWithdrawal.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="investments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="investments">Meus Investimentos</TabsTrigger>
            <TabsTrigger value="withdrawals">Resgates</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Investimentos Tab */}
          <TabsContent value="investments" className="space-y-6">
            <div className="grid gap-6">
              {investments.map((investment) => {
                const plan = INVESTMENT_PLANS.find((p) => p.id === investment.planId)
                const canWithdrawNow = canWithdraw(investment)
                const unlockDate = new Date(investment.unlockDate)
                const now = new Date()
                const daysUntilUnlock = Math.ceil((unlockDate - now) / (1000 * 60 * 60 * 24))
                const progressPercent = Math.min(
                  100,
                  Math.max(
                    0,
                    ((now - new Date(investment.purchaseDate)) / (unlockDate - new Date(investment.purchaseDate))) *
                      100,
                  ),
                )

                return (
                  <Card key={investment.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{plan?.name}</CardTitle>
                          <p className="text-zinc-600">ID: {investment.id}</p>
                        </div>
                        <Badge
                          variant={investment.status === "confirmed" ? "default" : "secondary"}
                          className={investment.status === "confirmed" ? "bg-green-500" : ""}
                        >
                          {investment.status === "confirmed" ? "Confirmado" : "Pendente"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Valores */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-zinc-600">Investimento</p>
                          <p className="font-bold">R$ {investment.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-600">Bônus</p>
                          <p className="font-bold text-green-600">R$ {investment.bonus.toLocaleString()}</p>
                        </div>
                        {investment.affiliateBonus > 0 && (
                          <div>
                            <p className="text-sm text-zinc-600">Bônus Afiliado</p>
                            <p className="font-bold text-blue-600">R$ {investment.affiliateBonus.toLocaleString()}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-zinc-600">Total</p>
                          <p className="font-bold text-purple-600">
                            R$ {(investment.amount + investment.bonus + investment.affiliateBonus).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Progresso do Lock */}
                      {investment.status === "confirmed" && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Período de Lock</span>
                            <span>
                              {canWithdrawNow ? "Disponível para resgate" : `${daysUntilUnlock} dias restantes`}
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                          <div className="flex justify-between text-xs text-zinc-500 mt-1">
                            <span>{new Date(investment.purchaseDate).toLocaleDateString()}</span>
                            <span>{unlockDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="flex items-center space-x-2 text-sm text-zinc-600">
                          <Calendar className="w-4 h-4" />
                          <span>Compra: {new Date(investment.purchaseDate).toLocaleDateString()}</span>
                        </div>

                        {canWithdrawNow && !investment.withdrawalRequested && (
                          <Button
                            onClick={() => handleWithdrawalRequest(investment.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Solicitar Resgate
                          </Button>
                        )}

                        {investment.withdrawalRequested && (
                          <Badge variant="outline" className="border-orange-500 text-orange-700">
                            Resgate Solicitado
                          </Badge>
                        )}

                        {!canWithdrawNow && investment.status === "confirmed" && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              const earlyAmount = calculateWithdrawalAmount(investment, true)
                              alert(
                                `Resgate antecipado disponível por R$ ${earlyAmount.toLocaleString()} (taxa de 10%)`,
                              )
                            }}
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Resgate Antecipado
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Resgates Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Resgate</CardTitle>
                <p className="text-zinc-600">Acompanhe suas solicitações de resgate</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments
                    .filter((inv) => inv.withdrawalRequested)
                    .map((investment) => (
                      <div key={investment.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                        <div>
                          <p className="font-semibold">Investimento {investment.id}</p>
                          <p className="text-sm text-zinc-600">
                            Solicitado em: {new Date(investment.withdrawalDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            R$ {(investment.amount + investment.bonus + investment.affiliateBonus).toLocaleString()}
                          </p>
                          <Badge variant="outline" className="border-orange-500 text-orange-700">
                            Em Processamento
                          </Badge>
                        </div>
                      </div>
                    ))}

                  {investments.filter((inv) => inv.withdrawalRequested).length === 0 && (
                    <div className="text-center py-8 text-zinc-500">
                      <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma solicitação de resgate encontrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Regras de Resgate */}
            <Card>
              <CardHeader>
                <CardTitle>Regras de Resgate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Período de Lock:</strong> Cada plano tem um período mínimo antes do resgate.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Resgate Antecipado:</strong> Disponível com taxa de 10% sobre o valor total.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Processamento:</strong> Resgates são processados em até 5 dias úteis.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Histórico Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {investments.map((investment) => (
                    <div key={investment.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                      <div>
                        <p className="font-semibold">
                          {INVESTMENT_PLANS.find((p) => p.id === investment.planId)?.name}
                        </p>
                        <p className="text-sm text-zinc-600">
                          {new Date(investment.purchaseDate).toLocaleDateString()} • {investment.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {investment.amount.toLocaleString()}</p>
                        <Badge variant={investment.status === "confirmed" ? "default" : "secondary"}>
                          {investment.status === "confirmed" ? "Confirmado" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
