"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, ArrowRight } from "lucide-react"

export default function LoginAfiliado() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [affiliateId, setAffiliateId] = useState("")
  const [senha, setSenha] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const idFromUrl = searchParams.get("id")
    if (idFromUrl) {
      setAffiliateId(idFromUrl)
    }
  }, [searchParams])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simula verificação de login
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Verifica se o afiliado existe (em produção seria uma API)
    const affiliateData = localStorage.getItem(`affiliate_${affiliateId}`)

    if (!affiliateData) {
      setError("ID de afiliado não encontrado. Verifique se você já se cadastrou.")
      setIsLoading(false)
      return
    }

    const affiliate = JSON.parse(affiliateData)

    // Senha padrão para demo (em produção seria hash)
    if (senha !== "123456" && senha !== affiliate.cpf?.replace(/\D/g, "").slice(-6)) {
      setError("Senha incorreta. Use 123456 ou os últimos 6 dígitos do seu CPF.")
      setIsLoading(false)
      return
    }

    // Login bem-sucedido
    localStorage.setItem("current_affiliate", affiliateId)

    // Track login
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "affiliate_login", {
        affiliate_id: affiliateId,
      })
    }

    router.push("/afiliado/dashboard")
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-800 mb-2">Área do Afiliado</h1>
          <p className="text-zinc-600">Acesse seu dashboard de vendas</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="affiliateId">ID do Afiliado</Label>
                <Input
                  id="affiliateId"
                  required
                  value={affiliateId}
                  onChange={(e) => setAffiliateId(e.target.value)}
                  placeholder="Ex: AGD123456"
                />
              </div>

              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                />
                <p className="text-xs text-zinc-500 mt-1">Use 123456 ou os últimos 6 dígitos do seu CPF</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Button variant="link" onClick={() => router.push("/afiliado/cadastro")} className="text-sm">
                Não tem conta? Cadastre-se aqui
              </Button>
              <br />
              <Button variant="link" onClick={() => router.push("/")} className="text-sm">
                ← Voltar ao site
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-center">🎯 Demo - Como testar:</h3>
            <div className="text-sm text-zinc-600 space-y-1">
              <p>1. Cadastre-se primeiro em "Não tem conta?"</p>
              <p>2. Use o ID gerado + senha 123456</p>
              <p>3. Ou teste com: ID "AGD123456" + senha "123456"</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
