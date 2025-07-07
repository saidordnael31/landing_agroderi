/**
 * util para disparar eventos no Matomo/Piwik.
 *
 * Exemplo de uso:
 *   import { trackEvent } from "@/utils/matomo"
 *   trackEvent("Ofertas", "Clique", "Plano Premium", 1)
 *
 * O código verifica se está no browser e se o array global `_paq`
 * (usado pelo Matomo) já existe; se não, cria-o antes de enviar o evento.
 */
export function trackEvent(category: string, action: string, name?: string, value?: number): void {
  // Evita executar no lado do servidor
  if (typeof window === "undefined") return

  // Garante que _paq exista
  const _paq = (window as unknown as { _paq: any[] })._paq || []
  ;(window as unknown as { _paq: any[] })._paq = _paq

  // Monta os argumentos conforme a API do Matomo
  const args: (string | number)[] = ["trackEvent", category, action]
  if (name !== undefined) args.push(name)
  if (value !== undefined) args.push(value)

  _paq.push(args)
}
