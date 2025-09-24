import * as S from "@effect/schema/Schema"

export const GetPortfolioSummaryQuerySchema = S.Struct({
  portfolioId: S.String
})
export type GetPortfolioSummaryQuery = S.Schema.ToAsserts<typeof GetPortfolioSummaryQuerySchema>

export const GenerateAdviceBodySchema = S.Struct({
  portfolioId: S.String,
  constraints: S.optional(S.Struct({
    prohibitedSymbols: S.optional(S.Array(S.String)),
    minDiversification: S.optional(S.Number),
    targetRisk: S.optional(S.Literal("LOW", "MEDIUM", "HIGH"))
  }))
})
export type GenerateAdviceBody = S.Schema.ToAsserts<typeof GenerateAdviceBodySchema>

export const AdviceResponse = S.Struct({
  planId: S.String,
  summary: S.String,
  actions: S.Array(S.Struct({
    type: S.Literal("BUY", "SELL", "REBALANCE"),
    symbol: S.optional(S.String),
    note: S.optional(S.String)
  })),
  rationale: S.Array(S.String)
})
export type AdviceResponse = S.Schema.ToAsserts<typeof AdviceResponse>
