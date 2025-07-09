"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, UserPlus, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { registerAffiliate, type RegisterAffiliateData } from "@/lib/supabase-auth"

export default function CadastroAfiliado() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    experiencia: "",
    canais: [] as string[],
    motivacao: "",
    senha: "",
    confirmarSenha: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

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

    // Validações no frontend
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
      console.log("🚀 [FRONTEND] Iniciando cadastro direto no Supabase...")

      const registerData: RegisterAffiliateData = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim(),
        cpf: formData.cpf.trim() || undefined,
        experiencia: formData.experiencia.trim() || undefined,
        canais: formData.canais,
        motivacao: formData.motivacao.trim() || undefined,
        senha: formData.senha,
      }

      const result = await registerAffiliate(registerData)

      console.log("📥 [FRONTEND] Resultado do cadastro:", result)

      if (result.success) {
        console.log("✅ [FRONTEND] Cadastro realizado com sucesso!")
        setSuccess(true)

        // Track evento de cadastro
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "sign_up", {
            method: "email",
            user_role: "affiliate",
          })
        }

        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push("/afiliado/login")
        }, 2000)
      } else {
        console.log("❌ [FRONTEND] Erro no cadastro:", result.error)
        setError(result.error || "Erro no cadastro")
      }
    } catch (error) {
      console.error("❌ [FRONTEND] Erro inesperado:", error)
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
              <p className="text-zinc-600">Sua conta foi criada com sucesso. Redirecionando para o login...</p>
              <Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto">
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

            {/* Senha */}
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

            {/* Experiência */}
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

            {/* Canais */}
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
                  Cadastrar como Afiliado
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
                <Link href="/" className="text-green-600 hover:underline">
                  ← Voltar ao início
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
