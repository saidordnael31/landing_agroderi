"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, Copy, QrCode, ArrowLeft, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [userData, setUserData] = useState(null)
  const [planData, setPlanData] = useState(null)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null) // 'confirmed', 'pending', null
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return

    const userDataParam = searchParams.get("userData")
    const planDataParam = searchParams.get("planData")

    if (userDataParam && planDataParam) {
      try {
        const parsedUserData = JSON.parse(decodeURIComponent(userDataParam))
        const parsedPlanData = JSON.parse(decodeURIComponent(planDataParam))

        setUserData(parsedUserData)
        setPlanData(parsedPlanData)
        setInitialized(true)
      } catch (error) {
        console.error("Error parsing URL parameters:", error)
        router.push("/ofertas")
      }
    } else {
      router.push("/ofertas")
    }
  }, [searchParams, initialized, router])

  const generatePixCode = useCallback(async () => {
    if (!userData || !planData) return
    console.log("Generating PIX code for value:", planData.monthlyCommitment)

    setLoading(true)
    try {
      const response = await fetch("/api/generate-pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: userData.cpf.replace(/\D/g, ""), // Remove formatting
          value: planData.monthlyCommitment, // Use actual plan value
        }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error Response:", errorData)
        throw new Error(`Erro ao gerar código PIX: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      console.log("PIX Code Response:", data)

      setQrCodeData({
        qrCodeImage: data.qrCode, // Base64 image data for QR code
        pixCode: data.paymentString, // PIX code string for copying
        success: data.success,
      })

      toast({
        title: "Código PIX gerado!",
        description: "Escaneie o QR Code ou copie o código para realizar o pagamento.",
      })
    } catch (error) {
      console.error("Error generating PIX code:", error)
      toast({
        title: "Erro",
        description: `Não foi possível gerar o código PIX: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [userData, planData, toast])

  const verifyPayment = useCallback(async () => {
    if (!userData || !planData) return

    setVerifyingPayment(true)
    try {
      const cpf = userData.cpf.replace(/\D/g, "") // Remove formatting
      const externalApiUrl = `https://api.agroderivative.tech/api/users/profile-by-cpf/?cpf=${cpf}`
      console.log("🔗 URL completa da requisição:", externalApiUrl)

      const headers = {
        Accept: "application/json",
      }

      const response = await fetch(externalApiUrl, {
        method: "GET",
        headers: headers,
      })

      if (!response.ok) {
        throw new Error("Erro ao verificar pagamento")
      }

      const data = await response.json()
      console.log("📊 Resposta da API:", data)

      // Check if payment was processed by looking at deposit_value
      const depositValue = Number.parseFloat(data.deposit_value || "0")
      const expectedValue = Number.parseFloat(planData.monthlyCommitment)

      if (depositValue >= expectedValue) {
        // Payment confirmed
        setPaymentStatus("confirmed")
        toast({
          title: "Pagamento confirmado!",
          description: "Redirecionando para o login...",
        })

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/membro/login")
        }, 2000)
      } else {
        // Payment still pending
        setPaymentStatus("pending")
        toast({
          title: "Pagamento ainda não processado",
          description: "Aguarde mais um pouco, o processamento pode demorar alguns minutos.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
      toast({
        title: "Erro",
        description: "Não foi possível verificar o pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setVerifyingPayment(false)
    }
  }, [userData, planData, toast, router])

  const copyPixCode = useCallback(() => {
    if (qrCodeData?.pixCode) {
      navigator.clipboard.writeText(qrCodeData.pixCode)
      toast({
        title: "Copiado!",
        description: "Código PIX copiado para a área de transferência.",
      })
    }
  }, [qrCodeData, toast])

  if (!initialized || !userData || !planData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">Carregando dados do checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-green-800">Checkout - Pagamento PIX</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{planData.name}</h3>
                <Badge variant="secondary" className="mb-3">
                  Duplo Benefício: Tokens + Tráfego
                </Badge>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tokens mensais:</span>
                    <span className="font-semibold">{planData.monthlyTokens.toLocaleString()} AGD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orçamento de tráfego:</span>
                    <span className="font-semibold">R$ {planData.trafficBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comissões de afiliado:</span>
                    <span className="font-semibold">Até 15%</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Dados do Cliente</h4>
                <div className="space-y-1 text-sm text-zinc-600">
                  <p>
                    <strong>Nome:</strong> {userData.nomeCompleto}
                  </p>
                  <p>
                    <strong>Email:</strong> {userData.email}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {userData.telefone}
                  </p>
                  <p>
                    <strong>CPF:</strong> {userData.cpf}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total do 1º mês:</span>
                <span className="text-green-600">R$ {planData.monthlyCommitment.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="w-5 h-5 mr-2 text-blue-600" />
                Pagamento via PIX
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!qrCodeData ? (
                <div className="text-center space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Gerar Código PIX</h3>
                    <p className="text-zinc-600 mb-4">
                      Clique no botão abaixo para gerar seu código PIX e finalizar o pagamento do primeiro mês.
                    </p>
                    <Button
                      onClick={generatePixCode}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Gerando...
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4 mr-2" />
                          Gerar Código PIX
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Payment Status Display */}
                  {paymentStatus === "confirmed" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-green-800 mb-1">Pagamento Confirmado!</h3>
                      <p className="text-green-700 text-sm">Redirecionando para o login...</p>
                    </div>
                  )}

                  {paymentStatus === "pending" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-yellow-800 mb-1">Pagamento Pendente</h3>
                      <p className="text-yellow-700 text-sm">
                        Aguarde mais um pouco, o processamento pode demorar alguns minutos.
                      </p>
                    </div>
                  )}

                  {/* QR Code Display */}
                  {paymentStatus !== "confirmed" && (
                    <>
                      <div className="text-center">
                        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-green-300 inline-block">
                          {qrCodeData.qrCodeImage ? (
                            <img
                              src={`data:image/png;base64,${qrCodeData.qrCodeImage}`}
                              alt="QR Code PIX"
                              className="w-48 h-48 mx-auto"
                            />
                          ) : (
                            <div className="w-48 h-48 bg-zinc-100 flex items-center justify-center">
                              <QrCode className="w-16 h-16 text-zinc-400" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-zinc-600 mt-2">Escaneie o QR Code com seu app bancário</p>
                      </div>

                      {/* PIX Code */}
                      {qrCodeData.pixCode && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Ou copie o código PIX:</label>
                          <div className="flex">
                            <input
                              type="text"
                              value={qrCodeData.pixCode}
                              readOnly
                              className="flex-1 px-3 py-2 border border-zinc-300 rounded-l-md bg-zinc-50 text-sm font-mono text-xs"
                            />
                            <Button
                              onClick={copyPixCode}
                              variant="outline"
                              className="rounded-l-none border-l-0 bg-transparent"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Payment Instructions */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">Instruções de Pagamento</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Abra seu app bancário ou carteira digital</li>
                          <li>• Escaneie o QR Code ou cole o código PIX</li>
                          <li>• Confirme o pagamento de R$ {planData.monthlyCommitment.toLocaleString()}</li>
                          <li>• Após o pagamento, clique em "Já fiz o pagamento"</li>
                          <li>• Seus tokens serão liberados em até 24 horas</li>
                        </ul>
                      </div>

                      {/* Payment Verification Button */}
                      <div className="text-center">
                        <Button
                          onClick={verifyPayment}
                          disabled={verifyingPayment}
                          className="bg-green-600 hover:bg-green-700 text-white w-full"
                        >
                          {verifyingPayment ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Verificando pagamento...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Já fiz o pagamento
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Support */}
                  <div className="text-center">
                    <p className="text-sm text-zinc-600 mb-2">Problemas com o pagamento?</p>
                    <Button variant="outline" size="sm">
                      Falar com Suporte
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
