"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, LogIn, AlertCircle } from "lucide-react"
import Link from "next/link"
import { loginUser, type LoginData } from "@/lib/supabase-auth"

export default function LoginAfiliado() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Validações no frontend
    if (!formData.email.trim() || !formData.senha.trim()) {
      setError("Email e senha são obrigatórios")
      setIsSubmitting(false)
      return
    }

    if (!formData.email.includes("@")) {
      setError("Email inválido")
      setIsSubmitting(false)
      return
    }

    try {
      console.log("🔐 [FRONTEND] Iniciando login direto no Supabase...")

      const loginData: LoginData = {
        email: formData.email.trim(),
        senha: formData.senha,
      }

      const result = await loginUser(loginData)

      console.log("📥 [FRONTEND] Resultado do login:", result)

      if (result.success) {
        console.log("✅ [FRONTEND] Login realizado com sucesso!")

        // Salvar dados no localStorage
        if (result.data) {
          localStorage.setItem("user", JSON.stringify(result.data.user))
          if (result.data.affiliate) {
            localStorage.setItem("affiliate", JSON.stringify(result.data.affiliate))
          }
        }

        // Track evento de login
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "login", {
            method: "email",
            user_role: result.data?.user?.role || "affiliate",
          })
        }

        // Redirecionar baseado no role
        const userRole = result.data?.user?.role
        if (userRole === "admin") {
          router.push("/admin/dashboard")
        } else if (userRole === "affiliate") {
          router.push("/afiliado/dashboard")
        } else {
          router.push("/membro/dashboard")
        }
      } else {
        console.log("❌ [FRONTEND] Erro no login:", result.error)
        setError(result.error || "Erro no login")
      }
    } catch (error) {
      console.error("❌ [FRONTEND] Erro inesperado:", error)
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800">Login de Afiliado</CardTitle>
          <p className="text-zinc-600">Acesse sua conta de afiliado</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
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

            <div>
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.senha}
                  onChange={(e) => setFormData((prev) => ({ ...prev, senha: e.target.value }))}
                  placeholder="Sua senha"
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
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-zinc-600">
                Não tem conta?{" "}
                <Link href="/afiliado/cadastro" className="text-green-600 hover:underline">
                  Cadastre-se aqui
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
