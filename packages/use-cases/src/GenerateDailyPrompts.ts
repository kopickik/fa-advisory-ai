import type { Compliance, MarketData, PortfolioRepo, ProfileRepo, PromptHistory } from "@template/adapters"
import type { MarketSnapshotDTO, PortfolioDTO, PromptSuggestionDTO, UserProfileDTO } from "@template/contracts"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Schedule from "effect/Schedule"

// Deps extended with history
export interface PromptDeps {
  profiles: ProfileRepo
  portfolios: PortfolioRepo
  market: MarketData
  compliance: Compliance
  history: PromptHistory
  clock?: () => string // ISO date-time, injectable for tests
}

const toDayKey = (iso: string) => iso.slice(0, 10) // YYYY-MM-DD

const retry3 = Schedule.recurs(3)
const timeout = <A, E, R>(ms: number) => (eff: Effect.Effect<A, E, R>) =>
  Effect.timeoutFail(eff, { onTimeout: () => new Error("timeout"), duration: Duration.millis(ms) })

const loadAll = (d: PromptDeps, userId: string) =>
  Effect.all(
    [
      pipe(Effect.promise(() => d.profiles.load(userId)), Effect.retry(retry3), timeout(200)),
      pipe(Effect.promise(() => d.portfolios.byOwnerId(userId)), Effect.retry(retry3), timeout(200)),
      pipe(Effect.promise(() => d.market.loadSnapshot()), Effect.retry(retry3), timeout(200))
    ] as const
  )

export const GenerateDailyPrompts = (deps: PromptDeps) => (userId: string) =>
  loadAll(deps, userId).pipe(
    Effect.flatMap(([profile, portfolio, market]) => {
      if (!profile || !portfolio) return Effect.succeed<Array<PromptSuggestionDTO>>([])

      // Rank candidates
      const candidates = buildCandidates(profile, portfolio, market)
      candidates.sort((a, b) => b.score - a.score)

      // Dedupe by recent history
      return Effect.promise(() => deps.history.recent(userId, 50)).pipe(
        Effect.flatMap((recent) => {
          const unique = candidates.filter((c) => !recent.includes(c.id)).slice(0, 3)
          // Fallback: if dedupe removes too many, backfill with the next-highest
          const need = 3 - unique.length
          const backfill = need > 0
            ? candidates.filter((c) => !unique.some((u) => u.id === c.id)).slice(0, need)
            : []
          const top = [...unique, ...backfill].slice(0, 3)

          // Compliance gate in parallel
          return Effect.forEach(top, (p) => Effect.promise(() => deps.compliance.approve(p))).pipe(
            Effect.map((list) => list.filter((x): x is PromptSuggestionDTO => x != null)),
            // Record impressions
            Effect.tap((shown) => {
              const now = deps.clock ? deps.clock() : new Date().toISOString()
              const day = toDayKey(now)
              return Effect.promise(() =>
                Promise.allSettled(shown.map((s) => deps.history.record(userId, day, s.id))).then(() => undefined)
              )
            })
          )
        })
      )
    })
  )

// same scoring skeleton; kept pure/deterministic for tests
function buildCandidates(
  profile: UserProfileDTO,
  portfolio: PortfolioDTO,
  market: MarketSnapshotDTO
): Array<PromptSuggestionDTO> {
  const reasons = (k: string) => [`risk=${profile.risk}`, `kind=${k}`]
  const m = market.factors?.momentum ?? 0
  const cash = portfolio.holdings.length === 0 ? 1 : 0
  const baseScore = { LOW: 0.8, MEDIUM: 1.0, HIGH: 1.2 }[profile.risk] ?? 1

  const c1: PromptSuggestionDTO = {
    id: `rebalance:${market.asOf}`,
    kind: "Rebalance",
    title: "Rebalance to target",
    body: "Your allocation drift suggests a small rebalance.",
    score: baseScore + 0.8 + m * 0.4,
    reasons: reasons("Rebalance"),
    actions: [{ type: "OPEN_REBALANCE", payload: { portfolioId: portfolio.id } }]
  }
  const c2: PromptSuggestionDTO = {
    id: `cash:${market.asOf}`,
    kind: "DeployCash",
    title: "Put idle cash to work",
    body: "Consider scheduling a monthly auto-invest plan.",
    score: baseScore + cash * 1.5 + m * 0.2,
    reasons: reasons("DeployCash"),
    actions: [{ type: "OPEN_AUTOINVEST", payload: { portfolioId: portfolio.id } }]
  }
  const c3: PromptSuggestionDTO = {
    id: `rates:${market.asOf}`,
    kind: "RatesShift",
    title: "Rates changed — review bond ladder",
    body: "Evaluate a barbell ladder to balance income and duration risk.",
    score: baseScore + (market.factors?.rate10y ?? 0) * 0.1,
    reasons: reasons("RatesShift"),
    actions: [{ type: "OPEN_BOND_LADDER_TOOL", payload: { portfolioId: portfolio.id } }]
  }
  return [c1, c2, c3]
}
