import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Coins,
  Sprout,
  Scaling,
  Vote,
  ShieldCheck,
  Flame,
  Recycle,
  GitBranch,
  Rocket,
  GanttChartSquare,
  Network,
  Users,
  Tractor,
  Handshake,
  LayoutGrid,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <Card className="bg-gray-800/50 border-gray-700 text-gray-200 h-full">
    <CardHeader>
      <div className="flex items-center gap-4">
        <Icon className="w-8 h-8 text-green-400" />
        <CardTitle className="text-xl">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-gray-400">{description}</p>
    </CardContent>
  </Card>
)

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="py-16">
    <h2 className="text-4xl font-bold text-center mb-12 text-white">{title}</h2>
    {children}
  </section>
)

const strategicFunctions = [
  {
    icon: Coins,
    title: "Meio de Troca",
    description:
      "Funciona como moeda e colateral em transações agroindustriais, facilitando negociações entre produtores e compradores com maior eficiência e segurança.",
  },
  {
    icon: Sprout,
    title: "Recebíveis Agrícolas",
    description:
      "Atua como moeda de origem para recebíveis do setor agrícola, permitindo a tokenização de ativos reais e facilitando o financiamento da produção.",
  },
  {
    icon: Scaling,
    title: "Staking e Farming",
    description:
      "Opera como motor para staking e yield farming com lastro em commodities reais, criando oportunidades de rendimento baseadas em ativos físicos.",
  },
  {
    icon: Vote,
    title: "Governança",
    description:
      "Habilita participação na DAO do ecossistema, dando aos holders poder de decisão sobre os rumos do protocolo e suas aplicações.",
  },
]

const tokenDistribution = [
  { label: "GEM (Market Maker)", value: 20, color: "bg-green-500" },
  { label: "Staking & Farming", value: 20, color: "bg-teal-500" },
  { label: "Tesouraria Estratégica", value: 15, color: "bg-cyan-500" },
  { label: "Fundadores & Equipe", value: 15, color: "bg-sky-500" },
  { label: "Parcerias/DAO/RWA", value: 10, color: "bg-blue-500" },
  { label: "Reserva/Queima", value: 5, color: "bg-indigo-500" },
  { label: "CEX/DEX Liquidez", value: 8, color: "bg-violet-500" },
  { label: "Venda Privada", value: 5, color: "bg-purple-500" },
  { label: "Pré-venda DeFi", value: 2, color: "bg-fuchsia-500" },
]

const salePhases = [
  { title: "Venda Privada", price: "US$ 0,01/token", supply: "5% do supply" },
  { title: "Pré-venda DeFi", price: "US$ 0,012/token", supply: "2% do supply" },
  { title: "Listagem em CEX/DEX", price: "US$ 0,015-0,02/token", supply: "8% do supply" },
]

const stabilizationMechanisms = [
  {
    icon: Flame,
    title: "Queima Programada",
    description: "5% dos drawdowns da GEM. Redução sistemática do supply para criar pressão de compra.",
  },
  {
    icon: Recycle,
    title: "Recompra Emergencial",
    description: "5% dos drawdowns da GEM. Fundo dedicado para intervenções rápidas em momentos de alta volatilidade.",
  },
  {
    icon: ShieldCheck,
    title: "Hedge Agro",
    description: "5% dos drawdowns da GEM. Proteção contra flutuações do mercado de commodities.",
  },
  {
    icon: GitBranch,
    title: "Staking com Lastro",
    description: "AGD staked lastreado em commodities tokenizadas, vinculando o valor a ativos reais.",
  },
]

const roadmapSteps = [
  {
    step: 1,
    title: "TGE (Token Generation Event)",
    details: { "Preço Alvo": "US$ 0,01", Circulante: "1,5B tokens", "Market Cap Estimado": "US$ 15M" },
  },
  {
    step: 2,
    title: "Q3/2025",
    details: { "Preço Alvo": "US$ 0,03", Circulante: "2,5B tokens", "Market Cap Estimado": "US$ 75M" },
  },
  {
    step: 3,
    title: "Q2/2026",
    details: { "Preço Alvo": "US$ 0,06", Circulante: "4B tokens", "Market Cap Estimado": "US$ 240M" },
  },
  {
    step: 4,
    title: "Q1/2027",
    details: { "Preço Alvo": "US$ 0,12", Circulante: "5,5B tokens", "Market Cap Estimado": "US$ 660M" },
  },
]

const competitiveDifferentials = [
  {
    icon: Scaling,
    title: "Supply Enxuto e Deflacionário",
    description: "Estratégia de redução do supply através de queimas programadas para criar escassez crescente.",
  },
  {
    icon: ShieldCheck,
    title: "Liquidez Programada e Protegida",
    description: "Sistema GEM atuando como suporte, garantindo estabilidade e previsibilidade ao mercado secundário.",
  },
  {
    icon: Tractor,
    title: "Uso Real em Agroativos",
    description:
      "Aplicação prática em financiamento, hedge e tokenização, conectando-se ao valor real da produção agrícola.",
  },
  {
    icon: Vote,
    title: "DAO Ativa e Transparente",
    description:
      "Estrutura de governança descentralizada com participação efetiva da comunidade nas decisões estratégicas.",
  },
]

const ecosystemIntegrations = [
  {
    icon: Sprout,
    title: "Tokenização de Commodities",
    description:
      "Plataforma para tokenizar ativos agrícolas físicos como soja e café. AGD serve como acesso e governança.",
  },
  {
    icon: GanttChartSquare,
    title: "Derivativos Descentralizados",
    description: "Mercado DeFi para contratos futuros e opções. AGD é usado como colateral e para pagamento de taxas.",
  },
  {
    icon: Coins,
    title: "Stablecoins Agroalgorítmicas",
    description: "Moedas estáveis lastreadas em índices de preços de commodities, com AGD atuando na governança.",
  },
  {
    icon: LayoutGrid,
    title: "Marketplace Agro-Financeiro",
    description: "Ambiente de negociação direta entre produtores e compradores. AGD serve como meio de pagamento.",
  },
]

const strategicPartnerships = [
  {
    icon: Users,
    title: "Cooperativas Agrícolas",
    description: "Parcerias para implementação de pilotos de tokenização de safras e sistemas de financiamento.",
  },
  {
    icon: Handshake,
    title: "Trading Houses",
    description:
      "Integrações com empresas de trading para desenvolvimento de mercados de derivativos descentralizados.",
  },
  {
    icon: Network,
    title: "Protocolos DeFi",
    description: "Colaborações para criar pools de liquidez, sistemas de empréstimo e staking baseados em commodities.",
  },
]

export default function WhitepaperPage() {
  return (
    <div className="bg-gray-900 text-gray-200">
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="text-center py-20">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
            AGD: A Revolução AgroDefi no Mercado de Commodities Agrícolas
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Desenvolvido pela AkinTec, o AGD permite que agricultores, traders e investidores globais interajam através
            de stablecoins, derivativos e garantias tokenizadas.
          </p>
          <p className="mt-4 text-sm text-gray-500">por Leandro Dias</p>
        </section>

        <Section title="Funções Estratégicas do Token AGD">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {strategicFunctions.map((func) => (
              <FeatureCard key={func.title} {...func} />
            ))}
          </div>
        </Section>

        <Section title="Distribuição do Supply Total de 10 Bilhões de AGD">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-gray-400 mb-10">
              O AGD possui um supply fixo de 10 bilhões de tokens, distribuídos para garantir equilíbrio e
              sustentabilidade. No primeiro ano, apenas 20% do supply (2 bilhões de AGD) estará em circulação.
            </p>
            <div className="space-y-4">
              {tokenDistribution.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1 text-white">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-3 [&>div]:bg-green-500" />
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Fases de Venda e Precificação Inicial">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-gray-400 mb-10">
              A estratégia foi estruturada em três fases com preços progressivos para recompensar os primeiros
              investidores, minimizando a volatilidade e fortalecendo a confiança no token.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {salePhases.map((phase) => (
                <Card key={phase.title} className="bg-gray-800/50 border-gray-700 text-center">
                  <CardHeader>
                    <CardTitle className="text-green-400 text-2xl">{phase.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xl font-bold text-white">{phase.price}</p>
                    <p className="text-gray-400">{phase.supply}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Mecanismos de Estabilização do Token">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stabilizationMechanisms.map((mech) => (
              <FeatureCard key={mech.title} {...mech} />
            ))}
          </div>
        </Section>

        <Section title="Roadmap de Valorização Projetada">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-700" aria-hidden="true"></div>
            {roadmapSteps.map((item, index) => (
              <div key={item.step} className="relative mb-12">
                <div className="absolute left-1/2 -translate-x-1/2 bg-gray-900 border-2 border-green-500 rounded-full w-12 h-12 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-green-500" />
                </div>
                <Card
                  className={`w-full md:w-[45%] p-6 bg-gray-800/50 border-gray-700 ${index % 2 === 0 ? "md:ml-auto" : "md:mr-auto"}`}
                >
                  <h3 className="text-xl font-bold text-green-400 mb-2">{item.title}</h3>
                  {Object.entries(item.details).map(([key, value]) => (
                    <p key={key} className="text-sm">
                      <span className="font-semibold text-gray-300">{key}:</span>{" "}
                      <span className="text-gray-400">{value}</span>
                    </p>
                  ))}
                </Card>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Diferenciais Competitivos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {competitiveDifferentials.map((diff) => (
              <FeatureCard key={diff.title} {...diff} />
            ))}
          </div>
        </Section>

        <Section title="Integrações com o Ecossistema AgroDeri">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ecosystemIntegrations.map((integration) => (
              <FeatureCard key={integration.title} {...integration} />
            ))}
          </div>
        </Section>

        <Section title="Parcerias Estratégicas e Ecossistema">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {strategicPartnerships.map((partner) => (
              <Card key={partner.title} className="bg-gray-800/50 border-gray-700 text-center h-full">
                <CardHeader>
                  <div className="mx-auto bg-gray-700 rounded-full p-3 w-fit">
                    <partner.icon className="w-8 h-8 text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold text-white mb-2">{partner.title}</h3>
                  <p className="text-gray-400">{partner.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* Footer Section */}
        <section className="text-center py-20">
          <h2 className="text-4xl font-bold text-white">Bem-vindo à revolução AGRO-DEFI.</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            O AGD representa mais que um simples token: é a infraestrutura digital de liquidez e valor para o
            agronegócio do futuro.
          </p>
        </section>
      </main>
    </div>
  )
}
