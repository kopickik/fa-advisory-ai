export type Currency = "USD" | "EUR" | "GBP"

export interface Holding {
  symbol: string
  quantity: number
  avgPrice: number
}
export interface Portfolio {
  id: string
  ownerId: string
  base: Currency
  holdings: Array<Holding>
}

export const totalValue = (p: Portfolio, prices: Record<string, number>) =>
  p.holdings.reduce((sum, h) => sum + (prices[h.symbol] ?? 0) * h.quantity, 0)

export const diversifyScore = (p: Portfolio) => Math.min(1, new Set(p.holdings.map((h) => h.symbol)).size / 20)
