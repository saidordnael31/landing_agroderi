// Server-side utilities that don't require client-side features

/**
 * Generates a unique affiliate code on the server side
 * Format: AGD + 5 random characters (letters and numbers)
 */
export function generateAffiliateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "AGD"

  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

/**
 * Generates a fallback affiliate code with timestamp for uniqueness
 */
export function generateFallbackAffiliateCode(): string {
  return `AGD${Date.now().toString().slice(-6)}`
}

/**
 * Maps selected plan to valid tier values for database constraint
 */
export function mapPlanToTier(selectedPlan: string): "standard" | "premium" {
  const premiumPlans = ["growth", "enterprise", "premium"]
  return premiumPlans.includes(selectedPlan.toLowerCase()) ? "premium" : "standard"
}
