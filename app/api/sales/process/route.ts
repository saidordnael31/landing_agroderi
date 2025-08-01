import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("💰 [SALES] Processando venda com comissões:", body)

    const {
      investmentId,
      affiliateCode,
      saleAmount,
      customerId,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
    } = body

    // Validações
    if (!investmentId || !affiliateCode || !saleAmount || !customerId) {
      return NextResponse.json({ error: "Dados obrigatórios faltando" }, { status: 400 })
    }

    // Buscar afiliado pelo código
    const { data: affiliate, error: affiliateError } = await supabaseAdmin
      .from("affiliates")
      .select("id, affiliate_code, status, leader_id")
      .eq("affiliate_code", affiliateCode.toUpperCase())
      .eq("status", "active")
      .single()

    if (affiliateError || !affiliate) {
      console.error("❌ [SALES] Afiliado não encontrado:", affiliateCode)
      return NextResponse.json({ error: "Afiliado não encontrado" }, { status: 404 })
    }

    console.log("✅ [SALES] Afiliado encontrado:", affiliate)

    // Chamar função do banco para calcular comissões
    const { data: commissionResult, error: commissionError } = await supabaseAdmin.rpc(
      "calculate_affiliate_commissions",
      {
        p_sale_amount: saleAmount,
        p_affiliate_id: affiliate.id,
        p_investment_id: investmentId,
        p_customer_id: customerId,
      },
    )

    if (commissionError) {
      console.error("❌ [SALES] Erro ao calcular comissões:", commissionError)
      return NextResponse.json({ error: "Erro ao calcular comissões" }, { status: 500 })
    }

    console.log("💳 [SALES] Comissões calculadas:", commissionResult)

    // Atualizar investimento como confirmado
    const { error: updateError } = await supabaseAdmin
      .from("investments")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", investmentId)

    if (updateError) {
      console.error("❌ [SALES] Erro ao atualizar investimento:", updateError)
    }

    // Registrar dados UTM na venda
    if (commissionResult.success && commissionResult.sale_id) {
      await supabaseAdmin
        .from("sales")
        .update({
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          utm_content: utmContent,
          utm_term: utmTerm,
        })
        .eq("id", commissionResult.sale_id)
    }

    return NextResponse.json({
      success: true,
      saleId: commissionResult.sale_id,
      commissionDirect: commissionResult.commission_direct,
      commissionLeader: commissionResult.commission_leader,
      affiliateId: commissionResult.affiliate_id,
      leaderId: commissionResult.leader_id,
      message: "Venda processada e comissões calculadas com sucesso!",
    })
  } catch (error) {
    console.error("💥 [SALES] Erro no processamento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
