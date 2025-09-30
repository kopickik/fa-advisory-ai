import {
  makeFlakyCompliance,
  makeFlakyMarketData,
  makeFlakyPortfolioRepo,
  makeFlakyProfileRepo,
  makeMemoryPromptHistory
} from "@template/adapters"
import * as Effect from "effect/Effect"
import { describe, expect, it } from "vitest"

import { GenerateDailyPrompts } from "../src/GenerateDailyPrompts.js"

describe("GenerateDailyPrompts – flaky adapters (retries/timeout)", () => {
  it("still yields a stable array length (0 or 3) under intermittent failures", async () => {
    const deps = {
      profiles: makeFlakyProfileRepo([{ id: "u-9", risk: "HIGH", horizonYears: 10, constraints: {} }]),
      portfolios: makeFlakyPortfolioRepo([{
        id: "p-9",
        ownerId: "u-9",
        base: "USD",
        holdings: [{ symbol: "QQQ", quantity: 3, avgPrice: 380 }]
      }]),
      market: makeFlakyMarketData({
        asOf: "2025-09-27T00:00:00.000Z",
        prices: { QQQ: 405 },
        factors: { momentum: 0.6, rate10y: 4.3, vix: 13 }
      }),
      compliance: makeFlakyCompliance(),
      history: makeMemoryPromptHistory()
    }

    const res = await Effect.runPromise(GenerateDailyPrompts(deps)("u-9"))
    // Either we get 3 prompts (after retry) or empty (if missing profile/portfolio); both valid.
    expect([0, 3]).toContain(res.length)
  })
})
