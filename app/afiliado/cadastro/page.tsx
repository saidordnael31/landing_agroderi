"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, DollarSign, TrendingUp, CheckCircle, ArrowRight } from "lucide-react"

export default function CadastroAfiliado() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    experiencia: "",
    canais: [],
    motivacao: "",
    aceiteTermos: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const canaisDisponiveis = [
    "Instagram",
    "Facebook",
    "YouTube",
    "TikTok",
    "WhatsApp",
    "Telegram",
    "Blog/Site",
    "Email Marketing",
    "LinkedIn",
    "Twitter/X",
  ]

  const handleCanalChange = (canal, checked) => {
    if (checked) {
      setFormData({ ...formData, canais: [...formData.canais, canal] })
    } else {
      setFormData({ ...formData, canais: formData.canais.filter((c) => c !== canal) })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simula envio para API
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Gera ID único para o afiliado
    const affiliateId = `AGD${Date.now().toString().slice(-6)}`

    // Salva dados do afiliado (em produção seria no banco)
    localStorage.setItem(
      `affiliate_${affiliateId}`,
      JSON.stringify({
        ...formData,
        id: affiliateId,
        status: "pendente",
        dataRegistro: new Date().toISOString(),
        comissao: 0,
        vendas: 0,
      }),
    )

    // Track evento
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "affiliate_registration", {
        affiliate_id: affiliateId,
      })
    }

    setSubmitted(true)
    setIsSubmitting(false)

    // Redireciona após 3 segundos
    setTimeout(() => {
      router.push(`/afiliado/login?id=${affiliateId}`)
    }, 3000)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-800 mb-4">Cadastro Realizado!</h1>
            <p className="text-zinc-600 mb-6">
              Seu cadastro foi enviado com sucesso. Em breve você receberá um email com suas credenciais de acesso.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700">
                <strong>Próximos passos:</strong>
                <br />
                1. Aguarde aprovação (até 24h)
                <br />
                2. Receba seu ID de afiliado
                <br />
                3. Comece a vender e ganhar!
              </p>
            </div>
            <Button onClick={() => router.push("/afiliado/login")} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-zinc-800 mb-4">Torne-se um Afiliado AGD</h1>
          <p className="text-xl text-zinc-600 mb-8">
            Ganhe comissões vendendo tokens AGD lastreados em commodities reais
          </p>

          {/* Benefícios */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Até 15% de Comissão</h3>
                <p className="text-sm text-zinc-600">Ganhe por cada venda realizada através dos seus links</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Suporte Completo</h3>
                <p className="text-sm text-zinc-600">Materiais de marketing e suporte dedicado</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Pagamentos Semanais</h3>
                <p className="text-sm text-zinc-600">Receba suas comissões toda semana via PIX</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Formulário de Cadastro</CardTitle>
            <p className="text-zinc-600">Preencha seus dados para se tornar um afiliado</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">WhatsApp *</Label>
                  <Input
                    id="telefone"
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    required
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              {/* Experiência */}
              <div>
                <Label htmlFor="experiencia">Experiência com Vendas/Marketing</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, experiencia: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua experiência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante (menos de 1 ano)</SelectItem>
                    <SelectItem value="intermediario">Intermediário (1-3 anos)</SelectItem>
                    <SelectItem value="avancado">Avançado (3-5 anos)</SelectItem>
                    <SelectItem value="expert">Expert (mais de 5 anos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Canais */}
              <div>
                <Label>Canais que você pretende usar *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {canaisDisponiveis.map((canal) => (
                    <div key={canal} className="flex items-center space-x-2">
                      <Checkbox
                        id={canal}
                        checked={formData.canais.includes(canal)}
                        onCheckedChange={(checked) => handleCanalChange(canal, checked)}
                      />
                      <Label htmlFor={canal} className="text-sm">
                        {canal}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motivação */}
              <div>
                <Label htmlFor="motivacao">Por que quer ser afiliado AGD?</Label>
                <Textarea
                  id="motivacao"
                  value={formData.motivacao}
                  onChange={(e) => setFormData({ ...formData, motivacao: e.target.value })}
                  placeholder="Conte-nos sua motivação..."
                  rows={3}
                />
              </div>

              {/* Termos */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termos"
                  checked={formData.aceiteTermos}
                  onCheckedChange={(checked) => setFormData({ ...formData, aceiteTermos: checked })}
                />
                <Label htmlFor="termos" className="text-sm leading-relaxed">
                  Aceito os{" "}
                  <a href="/termos-afiliados" className="text-green-600 hover:underline">
                    termos e condições
                  </a>{" "}
                  do programa de afiliados e autorizo o uso dos meus dados para fins comerciais.
                </Label>
              </div>

              {formData.canais.length === 0 && (
                <Alert>
                  <AlertDescription>Selecione pelo menos um canal de divulgação.</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!formData.aceiteTermos || formData.canais.length === 0 || isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Cadastrar como Afiliado"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Como funciona o programa de afiliados?</h4>
              <p className="text-sm text-zinc-600">
                Você recebe links únicos para divulgar. Cada pessoa que comprar através do seu link gera comissão para
                você.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quando recebo as comissões?</h4>
              <p className="text-sm text-zinc-600">
                As comissões são pagas semanalmente via PIX, toda segunda-feira, para vendas confirmadas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Preciso ter experiência?</h4>
              <p className="text-sm text-zinc-600">
                Não! Oferecemos treinamento completo e materiais de marketing para todos os afiliados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
