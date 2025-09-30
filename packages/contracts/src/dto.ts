// packages/contracts/src/schemas.ts
import * as S from "effect/Schema"

// ---------- Portfolio ----------
export const GetPortfolioSummaryQuerySchema = S.Struct({
  portfolioId: S.String
})
// You can export the inferred TS type if you want:
export type GetPortfolioSummaryQuery = typeof GetPortfolioSummaryQuerySchema.Type

// ---------- Advice ----------
export const GenerateAdviceBodySchema = S.Struct({
  portfolioId: S.String,
  constraints: S.optional(
    S.Struct({
      prohibitedSymbols: S.optional(S.Array(S.String)),
      minDiversification: S.optional(S.Number),
      targetRisk: S.optional(S.Union(S.Literal("LOW"), S.Literal("MEDIUM"), S.Literal("HIGH")))
    })
  )
})
export type GenerateAdviceBody = typeof GenerateAdviceBodySchema.Type
