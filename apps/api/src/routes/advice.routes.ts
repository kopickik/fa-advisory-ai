// apps/api/src/routes/advice.routes.ts
import { makeMemoryPortfolioRepo } from "@adapters"
import { makeOpenAiService } from "@ai"
import { GenerateAdviceBodySchema } from "@contracts"
import { createHandler } from "@shared"
import { GenerateAdvicePlanDraft } from "@use-cases"

const seed = [
  {
    id: "p-123",
    ownerId: "u-42",
    base: "USD" as const,
    holdings: [{ symbol: "AAPL", quantity: 10, avgPrice: 120 }]
  }
]

export async function adviceRoutes(app: any) {
  const repo = makeMemoryPortfolioRepo(seed)
  const ai = makeOpenAiService()

  app.post(
    "/advice/plan",
    createHandler(
      GenerateAdviceBodySchema,
      (req) => req.body,
      (q) => GenerateAdvicePlanDraft({ repo, ai })(q)
    )
  )
}
