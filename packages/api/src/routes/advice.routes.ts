import { makeMemoryPortfolioRepo } from "@template/adapters"
import { makeOpenAiService } from "@template/ai"
import { GenerateAdviceBodySchema } from "@template/contracts"
import { createHandler } from "@template/shared"
import { GenerateAdvicePlanDraft } from "@template/use-cases"

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
