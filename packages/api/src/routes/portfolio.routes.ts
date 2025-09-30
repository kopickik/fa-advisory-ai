import { makeMemoryPortfolioRepo } from "@template/adapters"
import { GetPortfolioSummaryQuerySchema } from "@template/contracts"
import { createHandler } from "@template/shared"
import { GetPortfolioSummary } from "@template/use-cases"
import type { FastifyInstance } from "fastify"

// Swagger-only JSON schema (optional, for docs)
const getPortfolioSummarySwagger = {
  querystring: {
    type: "object",
    properties: {
      portfolioId: { type: "string", description: "Portfolio ID (e.g., p-1)" }
    },
    required: ["portfolioId"],
    additionalProperties: false
  }
}

export async function portfolioRoutes(app: FastifyInstance) {
  const repo = makeMemoryPortfolioRepo([
    // seed data…
  ])

  // ✅ Return Record<string, number> (not Map)
  const prices = async (symbols: ReadonlyArray<string>): Promise<Record<string, number>> => {
    const obj: Record<string, number> = {}
    for (const s of symbols) obj[s] = 100 // stub
    return obj
  }

  app.get(
    "/portfolio/summary",
    { schema: getPortfolioSummarySwagger },
    createHandler(
      GetPortfolioSummaryQuerySchema, // Schema<{portfolioId:string}, {portfolioId:string}>
      (req) => req.query as { portfolioId: string }, // ✅ make I match the schema’s encoded type
      (q) => GetPortfolioSummary({ repo, prices })(q)
    )
  )
}
