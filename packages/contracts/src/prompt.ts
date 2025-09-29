import * as S from "@effect/schema/Schema"

// --- Base contracts
export const Risk = S.Literal("LOW", "MEDIUM", "HIGH")

export const HoldingDTO = S.Struct({
  symbol: S.String,
  quantity: S.Number,
  avgPrice: S.Number
})

export const PortfolioDTO = S.Struct({
  id: S.String,
  ownerId: S.String,
  base: S.Literal("USD", "EUR", "GBP"),
  holdings: S.Array(HoldingDTO)
})
export type PortfolioDTO = S.Schema.Type<typeof PortfolioDTO>

export const UserProfileDTO = S.Struct({
  id: S.String,
  risk: Risk,
  horizonYears: S.Number,
  constraints: S.Struct({
    exclude: S.optional(S.Array(S.String)),
    minDiversification: S.optional(S.Number)
  })
})
export type UserProfileDTO = S.Schema.Type<typeof UserProfileDTO>

export const MarketSnapshotDTO = S.Struct({
  asOf: S.String, // ISO
  prices: S.Record({ key: S.String, value: S.Number }),
  factors: S.Struct({
    vix: S.optional(S.Number),
    rate10y: S.optional(S.Number),
    breadth: S.optional(S.Number),
    momentum: S.optional(S.Number)
  })
})
export type MarketSnapshotDTO = S.Schema.Type<typeof MarketSnapshotDTO>

// --- Prompt contracts
export const PromptActionDTO = S.Struct({
  type: S.String,
  payload: S.Record({ key: S.String, value: S.Unknown })
})

export const PromptSuggestionDTO = S.Struct({
  id: S.String,
  kind: S.String,
  title: S.String,
  body: S.String,
  score: S.Number,
  reasons: S.Array(S.String),
  actions: S.Array(PromptActionDTO),
  complianceNote: S.optional(S.String)
})
export type PromptSuggestionDTO = S.Schema.Type<typeof PromptSuggestionDTO>

// --- Query for GET /prompts/today
export const GetPromptsQuerySchema = S.Struct({
  userId: S.String
})
export type GetPromptsQuery = S.Schema.Type<typeof GetPromptsQuerySchema>
