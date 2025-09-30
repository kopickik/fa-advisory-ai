// packages/use-cases/src/GetPortfolioSummary.ts
import type { PortfolioRepo } from "@template/adapters"
import type { Portfolio } from "@template/domain"
import { diversifyScore, totalValue } from "@template/domain"
import { type AppError, err, fromUnknown, ok, type Result } from "@template/shared"
import * as Effect from "effect/Effect"

export interface PortfolioSummary {
  portfolioId: string
  ownerId: string
  base: "USD" | "EUR" | "GBP"
  total: number
  diversify: number
}

export interface Deps {
  repo: PortfolioRepo
  // symbol[] -> { [symbol]: price }
  prices: (symbols: ReadonlyArray<string>) => Promise<Record<string, number>>
}

export interface Query {
  portfolioId: string
}

// Effect<Result<PortfolioSummary, AppError>, never>
export const GetPortfolioSummary = (deps: Deps) => (q: Query) =>
  Effect.promise(() => deps.repo.getById(q.portfolioId)).pipe(
    Effect.flatMap((p: Portfolio | null): Effect.Effect<Result<PortfolioSummary, AppError>, never> => {
      if (!p) {
        return Effect.succeed(
          err({ kind: "NotFound", msg: `Portfolio ${q.portfolioId} not found` })
        )
      }

      const symbols: ReadonlyArray<string> = p.holdings.map((h) => h.symbol)

      return Effect.promise(() => deps.prices(symbols)).pipe(
        Effect.map((priceMap: Record<string, number>) =>
          ok({
            portfolioId: p.id,
            ownerId: p.ownerId,
            base: p.base,
            total: totalValue(p, priceMap),
            diversify: diversifyScore(p)
          })
        ),
        // Map price loader failures to AppError
        Effect.catchAll((e) => Effect.succeed(err(fromUnknown(e))))
      )
    }),
    // Map repo failures to AppError
    Effect.catchAll((e) => Effect.succeed(err(fromUnknown(e))))
  )
