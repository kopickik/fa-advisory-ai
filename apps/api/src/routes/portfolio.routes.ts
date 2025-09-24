// apps/api/src/routes/portfolio.routes.ts
import { makeMemoryPortfolioRepo } from "@adapters"
import { GetPortfolioSummaryQuerySchema } from "@contracts"
import { createHandler } from "@shared"
import { GetPortfolioSummary } from "@use-cases"

export async function portfolioRoutes(app: any) {
  const repo = makeMemoryPortfolioRepo([/* ...seed... */])
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
