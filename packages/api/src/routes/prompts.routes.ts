import {
  makeMemoryMarketData,
  makeMemoryPortfolioRepo,
  makeMemoryProfileRepo,
  makeMemoryPromptHistory,
  makePassThroughCompliance
} from "@template/adapters"
import type { PromptSuggestionDTO } from "@template/contracts"
import { GetPromptsQuerySchema } from "@template/contracts"
import { createHandler } from "@template/shared"
import { type AppError, err, fromUnknown, ok, type Result } from "@template/shared"
import { GenerateDailyPrompts } from "@template/use-cases"
import * as Effect from "effect/Effect"
import type { FastifyInstance } from "fastify"

// --- Swagger-only JSON schema (for docs/UI) ----------------------------
const getPromptsTodaySwagger = {
  querystring: {
    type: "object",
    properties: { userId: { type: "string", description: "User ID" } },
    required: ["userId"],
    additionalProperties: false
  }
}

export async function promptsRoutes(app: FastifyInstance) {
  // In-memory adapters (replace with real impls later)
  const profiles = makeMemoryProfileRepo([
    { id: "u-1", risk: "MEDIUM", horizonYears: 5, constraints: {} }
  ])

  const portfolios = makeMemoryPortfolioRepo([
    {
      id: "p-1",
      ownerId: "u-1",
      base: "USD",
      holdings: [{ symbol: "SPY", quantity: 10, avgPrice: 450 }]
    }
  ])

  const market = makeMemoryMarketData({
    asOf: "2025-09-27T00:00:00.000Z",
    prices: { SPY: 471 },
    factors: { momentum: 0.51, rate10y: 4.21, vix: 13.9, breadth: 0.53 }
  })

  const compliance = makePassThroughCompliance()
  const history = makeMemoryPromptHistory()

  app.get(
    "/prompts/today",
    { schema: getPromptsTodaySwagger },
    createHandler(
      GetPromptsQuerySchema, // Effect schema
      (req) => req.query as { userId: string }, // encoded input shape
      (q): Effect.Effect<Result<ReadonlyArray<PromptSuggestionDTO>, AppError>, never, never> =>
        GenerateDailyPrompts({ profiles, portfolios, market, compliance, history })(q.userId).pipe(
          Effect.map((prompts) => ok(prompts as ReadonlyArray<PromptSuggestionDTO>)),
          Effect.catchAll((e) => Effect.succeed(err(fromUnknown(e))))
        )
    )
  )
}
