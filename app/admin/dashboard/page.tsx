"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, DollarSign, TrendingUp, Download, Eye, Shield, Search, RefreshCw, FileSpreadsheet } from "lucide-react"
import { generateSheetsData } from "@/lib/business-rules"

export default function AdminDashboard() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Dados demo
  const [stats, setStats] = useState({
    totalUsers: 156,
    totalInvestments: 89,
    totalVolume: 245000,
    totalCommissions: 18500,
    pendingWithdrawals: 12,
    activeAffiliates: 23,
  })

  const [investments, setInvestments] = useState([
    {
      id: "INV001",
      userId: "joao@email.com",
      userName: "João Silva",
      planId: "intermediate",
      planName: "Plano Intermediário",
      amount: 2000,
      bonus: 300,
      affiliateBonus: 60,
      affiliateId: "AGD123456",
      status: "confirmed",
      purchaseDate: "2024-01-10T10:00:00Z",
      unlockDate: "2024-03-10T10:00:00Z",
      withdrawalRequested: false,
    },
    {
      id: "INV002",
      userId: "maria@email.com",
      userName: "Maria Santos",
      planId: "premium",
      planName: "Plano Premium",
      amount: 8000,
      bonus: 2000,
      affiliateBonus: 400,
      affiliateId: "AGD789012",
      status: "confirmed",
      purchaseDate: "2024-01-15T14:30:00Z",
      unlockDate: "2024-04-15T14:30:00Z",
      withdrawalRequested: true,
    },
    {
      id: "INV003",
      userId: "carlos@email.com",
      userName: "Carlos Oliveira",
      planId: "starter",
      planName: "Plano Iniciante",
      amount: 500,
      bonus: 25,
      affiliateBonus: 0,
      status: "pending",
      purchaseDate: "2024-01-20T09:15:00Z",
      unlockDate: "2024-02-19T09:15:00Z",
      withdrawalRequested: false,
    },
  ])

  const [commissions, setCommissions] = useState([
    {
      id: "COM001",
      affiliateId: "AGD123456",
      affiliateName: "Pedro Afiliado",
      investmentId: "INV001",
      amount: 160,
      percentage: 8,
      status: "pending",
      generatedAt: "2024-01-10T10:00:00Z",
    },
    {
      id: "COM002",
      affiliateId: "AGD789012",
      affiliateName: "Ana Vendedora",
      investmentId: "INV002",
      amount: 800,
      percentage: 10,
      status: "paid",
      generatedAt: "2024-01-15T14:30:00Z",
      paidAt: "2024-01-22T10:00:00Z",
    },
  ])

  useEffect(() => {
    const currentUser = localStorage.getItem("current_user")
    if (!currentUser) {
      router.push("/membro/login")
      return
    }

    const user = JSON.parse(currentUser)
    if (user.role !== "admin" && user.role !== "viewer") {
      router.push("/membro/login")
      return
    }

    setUserData(user)
  }, [router])

  const handleExportToSheets = () => {
    const sheetsData = generateSheetsData(investments, commissions)

    // Simula export para Google Sheets
    const dataStr = JSON.stringify(sheetsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `agd-data-${new Date().toISOString().split("T")[0]}.json`
    link.click()

    alert("Dados exportados! Em produção, isso seria enviado automaticamente para o Google Sheets.")
  }

  const handleUpdateCommissionStatus = (commissionId, newStatus) => {
    setCommissions((prev) =>
      prev.map((comm) =>
        comm.id === commissionId
          ? { ...comm, status: newStatus, paidAt: newStatus === "paid" ? new Date().toISOString() : undefined }
          : comm,
      ),
    )
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

  const filteredInvestments = investments.filter((inv) => {
    const matchesSearch =
      inv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || inv.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const isAdmin = userData.role === "admin"

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-zinc-800">
                {isAdmin ? "Dashboard Administrativo" : "Dashboard de Visualização"}
              </h1>
              <p className="text-zinc-600">
                {userData.name} • {isAdmin ? "Administrador" : "Visualizador"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className={isAdmin ? "border-red-500 text-red-700" : "border-blue-500 text-blue-700"}
              >
                {isAdmin ? <Shield className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                {isAdmin ? "Admin" : "Viewer"}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-xs text-zinc-600">Usuários</p>
                  <p className="text-lg font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-xs text-zinc-600">Investimentos</p>
                  <p className="text-lg font-bold">{stats.totalInvestments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-xs text-zinc-600">Volume Total</p>
                  <p className="text-lg font-bold">R$ {stats.totalVolume.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-xs text-zinc-600">Comissões</p>
                  <p className="text-lg font-bold">R$ {stats.totalCommissions.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Download className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="text-xs text-zinc-600">Resgates</p>
                  <p className="text-lg font-bold">{stats.pendingWithdrawals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-xs text-zinc-600">Afiliados</p>
                  <p className="text-lg font-bold">{stats.activeAffiliates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Button onClick={handleExportToSheets} className="bg-green-600 hover:bg-green-700">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar para Sheets
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="investments">Investimentos</TabsTrigger>
            <TabsTrigger value="commissions">Comissões</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investimentos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {investments.slice(0, 5).map((investment) => (
                      <div key={investment.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{investment.userName}</p>
                          <p className="text-sm text-zinc-600">{investment.planName}</p>
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

              <Card>
                <CardHeader>
                  <CardTitle>Comissões Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {commissions
                      .filter((c) => c.status === "pending")
                      .map((commission) => (
                        <div
                          key={commission.id}
                          className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold">{commission.affiliateName}</p>
                            <p className="text-sm text-zinc-600">ID: {commission.affiliateId}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">R$ {commission.amount.toLocaleString()}</p>
                            {isAdmin && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateCommissionStatus(commission.id, "paid")}
                                className="mt-1"
                              >
                                Marcar como Pago
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar por nome ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="confirmed">Confirmados</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Investimentos */}
            <Card>
              <CardHeader>
                <CardTitle>Todos os Investimentos ({filteredInvestments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredInvestments.map((investment) => (
                    <div key={investment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{investment.userName}</h3>
                          <p className="text-sm text-zinc-600">
                            {investment.id} • {investment.planName}
                          </p>
                        </div>
                        <Badge variant={investment.status === "confirmed" ? "default" : "secondary"}>
                          {investment.status === "confirmed" ? "Confirmado" : "Pendente"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-zinc-600">Investimento</p>
                          <p className="font-bold">R$ {investment.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-zinc-600">Bônus</p>
                          <p className="font-bold text-green-600">R$ {investment.bonus.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-zinc-600">Bônus Afiliado</p>
                          <p className="font-bold text-blue-600">R$ {investment.affiliateBonus.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-zinc-600">Total</p>
                          <p className="font-bold text-purple-600">
                            R$ {(investment.amount + investment.bonus + investment.affiliateBonus).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-600">Data</p>
                          <p className="font-bold">{new Date(investment.purchaseDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {investment.affiliateId && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                          <p>
                            <strong>Afiliado:</strong> {investment.affiliateId}
                          </p>
                        </div>
                      )}

                      {investment.withdrawalRequested && (
                        <Alert className="mt-3">
                          <Download className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Resgate solicitado</strong> - Processamento necessário
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Comissões</CardTitle>
                <p className="text-zinc-600">
                  {isAdmin ? "Gerencie e processe pagamentos de comissões" : "Visualize comissões dos afiliados"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissions.map((commission) => (
                    <div key={commission.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{commission.affiliateName}</h3>
                          <p className="text-sm text-zinc-600">
                            ID: {commission.affiliateId} • Investimento: {commission.investmentId}
                          </p>
                          <p className="text-sm text-zinc-600">
                            Gerado em: {new Date(commission.generatedAt).toLocaleDateString()}
                          </p>
                          {commission.paidAt && (
                            <p className="text-sm text-green-600">
                              Pago em: {new Date(commission.paidAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">R$ {commission.amount.toLocaleString()}</p>
                          <p className="text-sm text-zinc-600">{commission.percentage}% de comissão</p>
                          <div className="mt-2">
                            <Badge
                              variant={commission.status === "paid" ? "default" : "secondary"}
                              className={commission.status === "paid" ? "bg-green-500" : ""}
                            >
                              {commission.status === "paid" ? "Pago" : "Pendente"}
                            </Badge>
                          </div>
                          {isAdmin && commission.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateCommissionStatus(commission.id, "paid")}
                              className="mt-2"
                            >
                              Marcar como Pago
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-zinc-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Funcionalidade de gestão de usuários em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
