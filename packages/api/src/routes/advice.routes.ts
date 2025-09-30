import { makeMemoryPortfolioRepo } from "@template/adapters"
import { makeOpenAiService } from "@template/ai"
import { createHandler } from "@template/shared"
import { type AppError, err, fromUnknown, ok, type Result } from "@template/shared"
import { GenerateAdvicePlanDraft } from "@template/use-cases"
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"
import type { FastifyInstance } from "fastify"

const seed = [
  {
    id: "p-123",
    ownerId: "u-42",
    base: "USD" as const,
    holdings: [{ symbol: "AAPL", quantity: 10, avgPrice: 120 }]
  }
]

// --- Swagger-only JSON schema (for docs/UI) ----------------------------
const generateAdviceSwagger = {
  body: {
    type: "object",
    properties: {
      portfolioId: { type: "string" },
      constraints: {
        type: "object",
        properties: {
          prohibitedSymbols: { type: "array", items: { type: "string" } },
          minDiversification: { type: "number" },
          targetRisk: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] }
        },
        additionalProperties: false
      }
    },
    required: ["portfolioId"],
    additionalProperties: false
  }
}

// --- Effect schema for handler decoding (do not mix with Swagger) ------
const GenerateAdviceBodySchema = S.Struct({
  portfolioId: S.String,
  constraints: S.optional(
    S.Struct({
      prohibitedSymbols: S.optional(S.Array(S.String)),
      minDiversification: S.optional(S.Number),
      targetRisk: S.optional(S.Union(S.Literal("LOW"), S.Literal("MEDIUM"), S.Literal("HIGH")))
    })
  )
})

type AdviceBody = S.Schema.Type<typeof GenerateAdviceBodySchema>

export async function adviceRoutes(app: FastifyInstance) {
  const repo = makeMemoryPortfolioRepo(seed)
  const ai = makeOpenAiService()

  app.post(
    "/advice/draft",
    { schema: generateAdviceSwagger },
    createHandler(
      GenerateAdviceBodySchema, // Effect schema
      (req) => req.body as AdviceBody, // encoded input shape
      (q): Effect.Effect<Result<unknown, AppError>, never, never> =>
        GenerateAdvicePlanDraft({ repo, ai })(q).pipe(
          Effect.map((plan) => ok(plan as unknown)),
          Effect.catchAll((e) => Effect.succeed(err(fromUnknown(e))))
        )
    )
  )
}
