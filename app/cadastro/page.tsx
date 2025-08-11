"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Loader2, UserPlus, CheckCircle, AlertCircle, Coins, TrendingUp, Target } from "lucide-react"
import Link from "next/link"
import { INVESTMENT_PLANS, calculateMonthlyCommitment, calculateExpectedTrafficResults } from "@/lib/business-rules"

export default function CadastroPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parâmetros da URL
  const planParam = searchParams.get("plan") || "starter"
  const affiliateParam = searchParams.get("ref") || ""

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
    experiencia: "",
    canais: [] as string[],
    motivacao: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Dados do plano selecionado
  const selectedPlan = INVESTMENT_PLANS.find((p) => p.id === planParam) || INVESTMENT_PLANS[0]
  const planDetails = calculateMonthlyCommitment(selectedPlan.id)
  const trafficResults = calculateExpectedTrafficResults(selectedPlan.monthlyValue)

  const canaisOptions = [
    "Instagram",
    "Facebook",
    "YouTube",
    "TikTok",
    "WhatsApp",
    "Telegram",
    "Blog/Site",
    "Email Marketing",
    "Outros",
  ]

  const handleChannelChange = (channel: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({ ...prev, canais: [...prev.canais, channel] }))
    } else {
      setFormData((prev) => ({ ...prev, canais: prev.canais.filter((c) => c !== channel) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess(false)

    // Validações
    if (!formData.nome.trim() || !formData.email.trim() || !formData.telefone.trim() || !formData.senha.trim()) {
      setError("Preencha todos os campos obrigatórios")
      setIsSubmitting(false)
      return
    }

    if (!formData.email.includes("@")) {
      setError("Email inválido")
      setIsSubmitting(false)
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem")
      setIsSubmitting(false)
      return
    }

    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsSubmitting(false)
      return
    }

    try {
      // 1. Registro no nosso banco de dados (Supabase)
      const internalResponse = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          selectedPlan: selectedPlan.id,
          affiliateCode: affiliateParam,
          registrationType: "commitment",
        }),
      })

      const internalResult = await internalResponse.json()

      if (!internalResult.success) {
        setError(internalResult.error || "Erro no cadastro interno")
        setIsSubmitting(false)
        return
      }

      // 2. Registro no banco de dados do Checkout (API externa)
      const [firstName, ...lastNameParts] = formData.nome.trim().split(" ")
      const lastName = lastNameParts.join(" ") || firstName // Se não houver sobrenome, usa o próprio nome

      const externalApiBody = {
        username: formData.email, // Usando email como username
        email: formData.email,
        password: formData.senha,
        password2: formData.confirmarSenha,
        first_name: firstName,
        last_name: lastName,
        cpf: formData.cpf.replace(/\D/g, ""), // Remove all non-digits
        whatsapp: formData.telefone, // Usando telefone como whatsapp
        affiliate: true, // Conforme a imagem, sempre true para este contexto
      }

      console.log("📦 [CHECKOUT_API] Enviando dados para API externa:", externalApiBody)

      const externalResponse = await fetch("https://api.agroderivative.tech/api/users/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(externalApiBody),
      })

      const externalResult = await externalResponse.json()

      if (!externalResponse.ok) {
        console.error("❌ [CHECKOUT_API] Erro no registro externo:", externalResult)
        // Se o registro externo falhar, podemos decidir se queremos reverter o interno
        // Por enquanto, apenas logamos o erro e continuamos, mas em um cenário real,
        // talvez seja necessário um mecanismo de compensação ou notificação.
        setError(externalResult.detail || "Erro ao registrar no sistema de checkout. Tente novamente.")
        setIsSubmitting(false)
        return
      }

      console.log("✅ [CHECKOUT_API] Registro externo bem-sucedido:", externalResult)

      setSuccess(true)

      // Track evento de cadastro
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "sign_up", {
          method: "email",
          user_role: "affiliate_commitment",
          plan_type: selectedPlan.id,
          commitment_value: selectedPlan.monthlyValue,
        })
      }

      setTimeout(() => {
        const userData = {
          nomeCompleto: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cpf: formData.cpf,
        }

        const planData = {
          name: selectedPlan.name,
          monthlyCommitment: selectedPlan.monthlyValue,
          monthlyTokens: planDetails?.monthlyTokens || 0,
          trafficBudget: selectedPlan.monthlyValue,
        }

        const userDataParam = encodeURIComponent(JSON.stringify(userData))
        const planDataParam = encodeURIComponent(JSON.stringify(planData))

        router.push(`/checkout?userData=${userDataParam}&planData=${planDataParam}`)
      }, 2000)
    } catch (error) {
      console.error("Erro inesperado:", error)
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold text-green-800">Cadastro Realizado!</h2>
              <p className="text-zinc-600">Sua conta foi criada com sucesso. Redirecionando para o checkout...</p>
              <Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 py-8 px-4">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Resumo do Plano Selecionado */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-green-800 flex items-center gap-2">
                  <Coins className="w-6 h-6" />
                  Plano {selectedPlan.name}
                </CardTitle>
                <p className="text-green-600">Duplo Benefício: Tokens + Tráfego Pago</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-lg px-4 py-2">
                R$ {selectedPlan.monthlyValue.toLocaleString("pt-BR")}/mês
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                <Coins className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-800">
                  {planDetails?.monthlyTokens.toLocaleString("pt-BR")}
                </div>
                <div className="text-sm text-zinc-600">Tokens/mês</div>
                <div className="text-xs text-green-600 mt-1">
                  +{(selectedPlan.bonusPercent * 100).toFixed(0)}% bônus
                </div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-800">
                  {trafficResults.estimatedClicks.toLocaleString("pt-BR")}
                </div>
                <div className="text-sm text-zinc-600">Cliques/mês</div>
                <div className="text-xs text-blue-600 mt-1">
                  R$ {selectedPlan.monthlyValue.toLocaleString("pt-BR")} em tráfego
                </div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-800">
                  R$ {trafficResults.estimatedCommissions.toLocaleString("pt-BR")}
                </div>
                <div className="text-sm text-zinc-600">Comissões/mês</div>
                <div className="text-xs text-purple-600 mt-1">~{trafficResults.estimatedConversions} vendas</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800 text-center">
                <strong>Compromisso:</strong> 4 meses • <strong>Total:</strong> R${" "}
                {(selectedPlan.monthlyValue * 4).toLocaleString("pt-BR")} •<strong>Lock:</strong> 30 dias após cada
                pagamento
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Cadastro */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-800">Cadastro de Afiliado</CardTitle>
            <p className="text-zinc-600">Junte-se ao nosso programa de afiliados</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-800">Informações Básicas</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                      placeholder="Seu nome completo"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      required
                      value={formData.telefone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf">CPF (opcional)</Label>
                    <Input
                      id="cpf"
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cpf: e.target.value }))}
                      placeholder="000.000.000-00"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Senha de Acesso */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-800">Senha de Acesso</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="senha">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="senha"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.senha}
                        onChange={(e) => setFormData((prev) => ({ ...prev, senha: e.target.value }))}
                        placeholder="Mínimo 6 caracteres"
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                    <div className="relative">
                      <Input
                        id="confirmarSenha"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmarSenha}
                        onChange={(e) => setFormData((prev) => ({ ...prev, confirmarSenha: e.target.value }))}
                        placeholder="Confirme sua senha"
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experiência em Marketing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-800">Experiência em Marketing</h3>
                <div>
                  <Label htmlFor="experiencia">Descreva sua experiência (opcional)</Label>
                  <Textarea
                    id="experiencia"
                    value={formData.experiencia}
                    onChange={(e) => setFormData((prev) => ({ ...prev, experiencia: e.target.value }))}
                    placeholder="Conte sobre sua experiência com marketing digital..."
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>
              </div>

              {/* Canais de Divulgação */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-800">Canais de Divulgação</h3>
                <p className="text-sm text-zinc-600">Selecione os canais que você pretende usar:</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {canaisOptions.map((canal) => (
                    <div key={canal} className="flex items-center space-x-2">
                      <Checkbox
                        id={canal}
                        checked={formData.canais.includes(canal)}
                        onCheckedChange={(checked) => handleChannelChange(canal, checked as boolean)}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor={canal} className="text-sm">
                        {canal}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motivação */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-800">Motivação</h3>
                <div>
                  <Label htmlFor="motivacao">Por que quer ser nosso afiliado? (opcional)</Label>
                  <Textarea
                    id="motivacao"
                    value={formData.motivacao}
                    onChange={(e) => setFormData((prev) => ({ ...prev, motivacao: e.target.value }))}
                    placeholder="Conte sua motivação..."
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Cadastrar e Ir para Checkout
                  </>
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-zinc-600">
                  Já tem conta?{" "}
                  <Link href="/afiliado/login" className="text-green-600 hover:underline">
                    Faça login aqui
                  </Link>
                </p>
                <p className="text-sm text-zinc-600">
                  <Link href="/ofertas" className="text-green-600 hover:underline">
                    ← Voltar aos planos
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
