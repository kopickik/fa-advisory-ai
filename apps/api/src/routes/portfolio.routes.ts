import { makeMemoryPortfolioRepo } from "@adapters"
import { GetPortfolioSummaryQuerySchema } from "@contracts"
import { createHandler } from "@shared"
import { GetPortfolioSummary } from "@use-cases"

export async function portfolioRoutes(app: any) {
  const repo = makeMemoryPortfolioRepo([
    { id: "p-1", ownerId: "u-1", base: "USD" as const, holdings: [{ symbol: "AAPL", quantity: 2, avgPrice: 100 }] }
  ])
  const prices = async () => ({ AAPL: 190 })

  app.get(
    "/portfolio/summary",
    createHandler(
      GetPortfolioSummaryQuerySchema,
      (req) => req.query,
      (q) => GetPortfolioSummary({ repo, prices })(q)
    )
  )
}
