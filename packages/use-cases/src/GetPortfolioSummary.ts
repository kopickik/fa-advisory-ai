import type { PortfolioRepo } from "@adapters"
import { diversifyScore, totalValue } from "@domain"
import type { AppError, Result } from "@shared"
import { err, ok } from "@shared"
import * as Effect from "effect/Effect"

type Out = { portfolioId: string; ownerId: string; base: "USD" | "EUR" | "GBP"; total: number; diversify: number }

export const GetPortfolioSummary =
  (deps: { repo: PortfolioRepo; prices: (s: Array<string>) => Promise<Record<string, number>> }) =>
  (q: { portfolioId: string }): Effect.Effect<Result<Out, AppError>, never> =>
    Effect.gen(function*() {
      const p = yield* Effect.promise(() => deps.repo.getById(q.portfolioId))
      if (!p) return err({ kind: "NotFound", msg: "Portfolio not found" })

      const prices = yield* Effect.promise(() => deps.prices(p.holdings.map((h) => h.symbol)))
      return ok({
        portfolioId: p.id,
        ownerId: p.ownerId,
        base: p.base,
        total: totalValue(p, prices),
        diversify: diversifyScore(p)
      })
    })
