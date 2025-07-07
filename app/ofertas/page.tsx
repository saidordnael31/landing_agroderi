"use client"
import { trackEvent } from "@/utils/matomo"

const OfertasPage = () => {
  const plans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: 10,
      description: "A basic plan with limited features.",
    },
    {
      id: "premium",
      name: "Premium Plan",
      price: 20,
      description: "A premium plan with advanced features.",
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      price: 50,
      description: "An enterprise plan with all features and support.",
    },
  ]

  const handlePaymentClick = () => {
    const currentOffer = plans[0] // Assuming offers is similar to plans and step is 0 for now

    // Track conversão de afiliado
    // if (affiliateId) { // affiliateId is not defined in the original code
    //   trackAffiliateConversion(affiliateId, "payment_click", currentOffer.minValue)
    // }

    // Redirecionar para o site oficial da AgroDeri
    window.open("https://www.agroderi.in", "_blank")
  }

  const handlePayment = (plan: any) => {
    trackEvent("payment_redirect", {
      plan_id: plan.id,
      plan_name: plan.name,
      plan_price: plan.price,
    })

    // Redirecionar para o site oficial da AgroDeri
    window.open("https://www.agroderi.in", "_blank")
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Nossas Ofertas</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-gray-700 mb-4">{plan.description}</p>
              <p className="text-2xl font-bold text-green-500">${plan.price}/mês</p>
            </div>
            <button
              onClick={() => handlePayment(plan)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Ir para o Pagamento
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OfertasPage
