"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Shield, Eye } from "lucide-react"

const t = {
  pt: {
    title: "Área do Membro",
    subtitle: "Acesse sua conta AGD Token",
    login: "Login",
    buyer: "Comprador",
    admin: "Admin",
    viewer: "Viewer",
    email: "Email",
    password: "Senha",
    enter: "Entrar",
    entering: "Entrando...",
    backToSite: "← Voltar ao site",
    demoCredentials: "Credenciais Demo",
    errorInvalidCredentials: "Email ou senha incorretos",
  },
  en: {
    title: "Member Area",
    subtitle: "Access your AGD Token account",
    login: "Login",
    buyer: "Buyer",
    admin: "Admin",
    viewer: "Viewer",
    email: "Email",
    password: "Password",
    enter: "Enter",
    entering: "Entering...",
    backToSite: "← Back to site",
    demoCredentials: "Demo Credentials",
    errorInvalidCredentials: "Invalid email or password",
  },
}

export default function LoginMembro() {
  const router = useRouter()
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    userType: "buyer",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState("pt")

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simula verificação de login
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Credenciais demo
    const demoCredentials = {
      // Admin
      "admin@agd.com": { password: "admin123", role: "admin", name: "Administrador" },
      // Viewer
      "viewer@agd.com": { password: "viewer123", role: "viewer", name: "Visualizador" },
      // Buyers
      "joao@email.com": { password: "123456", role: "buyer", name: "João Silva" },
      "maria@email.com": { password: "123456", role: "buyer", name: "Maria Santos" },
    }

    const user = demoCredentials[loginData.email]

    if (!user || user.password !== loginData.password) {
      setError(t[language].errorInvalidCredentials)
      setIsLoading(false)
      return
    }

    // Salva dados do usuário logado
    localStorage.setItem(
      "current_user",
      JSON.stringify({
        email: loginData.email,
        role: user.role,
        name: user.name,
        loginTime: new Date().toISOString(),
      }),
    )

    // Redireciona baseado no tipo de usuário
    if (user.role === "admin" || user.role === "viewer") {
      router.push("/admin/dashboard")
    } else {
      router.push("/membro/dashboard")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-800 mb-2">{t[language].title}</h1>
          <p className="text-zinc-600">{t[language].subtitle}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t[language].login}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buyer" className="mb-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="buyer" onClick={() => setLoginData({ ...loginData, userType: "buyer" })}>
                  <User className="w-4 h-4 mr-1" />
                  {t[language].buyer}
                </TabsTrigger>
                <TabsTrigger value="admin" onClick={() => setLoginData({ ...loginData, userType: "admin" })}>
                  <Shield className="w-4 h-4 mr-1" />
                  {t[language].admin}
                </TabsTrigger>
                <TabsTrigger value="viewer" onClick={() => setLoginData({ ...loginData, userType: "viewer" })}>
                  <Eye className="w-4 h-4 mr-1" />
                  {t[language].viewer}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buyer" className="mt-4">
                <Alert className="mb-4">
                  <User className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{t[language].demoCredentials} Compradores:</strong>
                    <br />
                    joao@email.com / 123456
                    <br />
                    maria@email.com / 123456
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="admin" className="mt-4">
                <Alert className="mb-4">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{t[language].demoCredentials} Admin:</strong>
                    <br />
                    admin@agd.com / admin123
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="viewer" className="mt-4">
                <Alert className="mb-4">
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{t[language].demoCredentials} Viewer:</strong>
                    <br />
                    viewer@agd.com / viewer123
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">{t[language].email}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="password">{t[language].password}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Sua senha"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t[language].entering : t[language].enter}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button variant="link" onClick={() => router.push("/")} className="text-sm">
                {t[language].backToSite}
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLanguage(language === "pt" ? "en" : "pt")}>
              {language === "pt" ? "EN" : "PT"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
