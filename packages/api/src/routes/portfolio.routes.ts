import { makeMemoryPortfolioRepo } from "@template/adapters"
import { GetPortfolioSummaryQuerySchema, getPortfolioSummarySchema } from "@template/contracts"
import { createHandler } from "@template/shared"
import { GetPortfolioSummary } from "@template/use-cases"
import type { FastifyInstance } from "fastify"

export async function portfolioRoutes(app: FastifyInstance) {
  const repo = makeMemoryPortfolioRepo([
    { id: "p-1", ownerId: "u-1", base: "USD" as const, holdings: [{ symbol: "AAPL", quantity: 2, avgPrice: 100 }] }
  ])
  const prices = async () => ({ AAPL: 190 })

  app.get(
    "/portfolio/summary",
    { schema: getPortfolioSummarySchema },
    createHandler(
      GetPortfolioSummaryQuerySchema,
      (req) => req.query,
      (q) => GetPortfolioSummary({ repo, prices })(q)
    )
  )
}
