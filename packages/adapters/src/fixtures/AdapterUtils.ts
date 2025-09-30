import type { Portfolio } from "@template/domain"

type PortfolioLike = {
  id: string
  ownerId: string
  base: Portfolio["base"]
  holdings: ReadonlyArray<{
    symbol: string
    quantity: number
    avgPrice: number
  }>
}

export const toMutablePortfolio = (p: PortfolioLike): Portfolio => ({
  id: p.id,
  ownerId: p.ownerId,
  base: p.base,
  // clone to ensure a mutable array + mutable elements
  holdings: p.holdings.map((h) => ({
    symbol: h.symbol,
    quantity: h.quantity,
    avgPrice: h.avgPrice
  }))
})
