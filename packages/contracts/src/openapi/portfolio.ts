import type { OpenAPISchema } from "./types.js"

export const getPortfolioSummarySchema: OpenAPISchema = {
  summary: "Get a portfolio summary",
  description: "Returns totals and diversification metrics.",
  tags: ["Portfolio"],
  querystring: {
    type: "object",
    properties: {
      portfolioId: { type: "string", description: "Portfolio ID (e.g., p-1)" }
    },
    required: ["portfolioId"],
    additionalProperties: false
  },
  response: {
    200: {
      type: "object",
      properties: {
        portfolioId: { type: "string" },
        ownerId: { type: "string" },
        base: { type: "string", enum: ["USD", "EUR", "GBP"] },
        total: { type: "number" },
        diversify: { type: "number" }
      },
      required: ["portfolioId", "ownerId", "base", "total", "diversify"]
    }
  }
}
