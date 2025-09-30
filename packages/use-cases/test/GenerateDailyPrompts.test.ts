import {
  makeMemoryMarketData,
  makeMemoryPortfolioRepo,
  makeMemoryProfileRepo,
  makeMemoryPromptHistory,
  makePassThroughCompliance
} from "@template/adapters"
import * as Effect from "effect/Effect"
import { describe, expect, it } from "vitest"
import { GenerateDailyPrompts } from "../src/GenerateDailyPrompts.js"

describe("GenerateDailyPrompts", () => {
  it("returns 3 approved prompts, ordered by score", async () => {
    const deps = {
      profiles: makeMemoryProfileRepo([{ id: "u-1", risk: "HIGH", horizonYears: 10, constraints: {} }]),
      portfolios: makeMemoryPortfolioRepo([{
        id: "p-1",
        ownerId: "u-1",
        base: "USD",
        holdings: [{ symbol: "QQQ", quantity: 5, avgPrice: 380 }]
      }]),
      market: makeMemoryMarketData({
        asOf: "2024-01-01T00:00:00.000Z",
        prices: { QQQ: 400 },
        factors: { momentum: 0.8, rate10y: 4.0, vix: 12, breadth: 0.6 }
      }),
      compliance: makePassThroughCompliance(),
      history: makeMemoryPromptHistory()
    }

    const eff = GenerateDailyPrompts(deps)("u-1")
    const prompts = await Effect.runPromise(eff)

    expect(prompts).toHaveLength(3)
    // deterministic ordering by score
    const scores = prompts.map((p) => p.score)
    expect([...scores].sort((a, b) => b - a)).toEqual(scores)
    // shape checks
    for (const p of prompts) {
      expect(p.id).toBeTruthy()
      expect(p.actions.length).toBeGreaterThan(0)
    }
  })

  it("returns empty when user or portfolio not found", async () => {
    const deps = {
      profiles: makeMemoryProfileRepo([]),
      portfolios: makeMemoryPortfolioRepo([]),
      market: makeMemoryMarketData({ asOf: "2024-01-01T00:00:00.000Z", prices: {}, factors: {} }),
      compliance: makePassThroughCompliance(),
      history: makeMemoryPromptHistory()
    }
    const prompts = await Effect.runPromise(GenerateDailyPrompts(deps)("missing"))
    expect(prompts).toEqual([])
  })
})
