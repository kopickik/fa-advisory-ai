import type { MarketSnapshotDTO, PortfolioDTO, UserProfileDTO } from "@template/contracts"

// Tiny deterministic PRNG
export function makeRng(seed = 42) {
  let s = seed >>> 0
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32
}

export function pick<T>(rng: () => number, arr: ReadonlyArray<T>): T {
  return arr[Math.floor(rng() * arr.length)]
}

export function genUserProfile(rng = makeRng(), id = "u-1"): UserProfileDTO {
  const risk = pick(rng, ["LOW", "MEDIUM", "HIGH"] as const)
  const horizonYears = Math.floor(rng() * 15) + 1
  const exclude = rng() < 0.3 ? ["XOM", "MO"] : undefined
  const minDiversification = rng() < 0.5 ? Math.floor(rng() * 8) + 5 : undefined
  return {
    id,
    risk,
    horizonYears,
    constraints: { exclude, minDiversification }
  }
}

type Sym = "SPY" | "QQQ" | "TLT" | "GLD" | "EFA" | "IWM"
export function genPortfolio(rng = makeRng(), ownerId = "u-1", id = "p-1"): PortfolioDTO {
  const symbols: Array<Sym> = ["SPY", "QQQ", "TLT", "GLD", "EFA", "IWM"]
  const k = Math.max(1, Math.floor(rng() * symbols.length))
  const picks = [...new Set(Array.from({ length: k }, () => pick(rng, symbols)))]
  const holdings = picks.map((s) => ({
    symbol: s,
    quantity: Math.floor(rng() * 20) + 1,
    avgPrice: Math.floor(rng() * 200) + 50
  }))
  return { id, ownerId, base: "USD", holdings }
}

export type Regime = "BULL" | "BEAR" | "RANGE" | "RATES_UP" | "RATES_DOWN"

export function genMarketSnapshot(
  rng = makeRng(),
  regime: Regime = "RANGE",
  asOf = "2025-01-01T00:00:00.000Z"
): MarketSnapshotDTO {
  const base: Record<string, number> = { SPY: 500, QQQ: 430, TLT: 92, GLD: 195, EFA: 80, IWM: 200 }
  const drift = (n: number) => Math.round(n * (0.95 + rng() * 0.1) * 100) / 100

  const prices = Object.fromEntries(
    Object.entries(base).map(([sym, p]) => {
      switch (regime) {
        case "BULL":
          return [sym, Math.round(p * (1.02 + rng() * 0.02) * 100) / 100]
        case "BEAR":
          return [sym, Math.round(p * (0.98 - rng() * 0.02) * 100) / 100]
        case "RATES_UP":
          return [sym, drift(p + (sym === "TLT" ? -5 : 3))]
        case "RATES_DOWN":
          return [sym, drift(p + (sym === "TLT" ? 5 : -2))]
        default:
          return [sym, drift(p)]
      }
    })
  )

  const factors = {
    momentum: regime === "BULL" ? 0.8 : regime === "BEAR" ? -0.6 : 0.2,
    rate10y: regime === "RATES_UP" ? 4.8 : regime === "RATES_DOWN" ? 3.2 : 4.2,
    vix: regime === "BEAR" ? 28 : 14,
    breadth: regime === "BULL" ? 0.65 : regime === "BEAR" ? 0.4 : 0.52
  }

  return { asOf, prices, factors }
}
