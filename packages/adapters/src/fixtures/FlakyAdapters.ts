import type { MarketSnapshotDTO, PortfolioDTO, PromptSuggestionDTO, UserProfileDTO } from "@template/contracts"
import type { Portfolio } from "@template/domain"
import type { Compliance } from "../Compliance.port.js"
import type { MarketData } from "../MarketData.port.js"
import type { PortfolioRepo } from "../PortfolioRepo.port.js"
import type { ProfileRepo } from "../ProfileRepo.port.js"
import { toMutablePortfolio } from "./AdapterUtils.js" // <-- add if using separate helper

type RNG = () => number

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const jitter = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export function withLatency<T extends object>(impl: T, min = 5, max = 30): T {
  return new Proxy(impl, {
    get(target, prop, rec) {
      const v = Reflect.get(target, prop, rec)
      if (typeof v !== "function") return v
      return async (...args: Array<any>) => {
        await sleep(jitter(min, max))
        return v.apply(target, args)
      }
    }
  })
}

export function withFailureRate<T extends object>(impl: T, rate = 0.05, rng: RNG = Math.random): T {
  const effectiveRate = process.env.CI === "true" ? 0 : rate

  return new Proxy(impl, {
    get(target, prop, rec) {
      const v = Reflect.get(target, prop, rec)
      if (typeof v !== "function") return v
      return async (...args: Array<any>) => {
        if (rng() < effectiveRate) throw new Error(`Transient: ${String(prop)} failed`)
        return v.apply(target, args)
      }
    }
  })
}

export const makeFlakyMarketData = (snapshot: MarketSnapshotDTO): MarketData =>
  withLatency(withFailureRate<MarketData>({
    async loadSnapshot() {
      return snapshot
    }
  }))

export const makeFlakyProfileRepo = (profiles: Array<UserProfileDTO>): ProfileRepo =>
  withLatency(withFailureRate<ProfileRepo>({
    async load(userId) {
      return profiles.find((p) => p.id === userId) ?? null
    }
  }))

export const makeFlakyPortfolioRepo = (
  portfolios: ReadonlyArray<Portfolio | PortfolioDTO>
): PortfolioRepo => {
  const store: Array<Portfolio> = portfolios.map((p) =>
    toMutablePortfolio({
      id: p.id,
      ownerId: p.ownerId,
      base: p.base as Portfolio["base"],
      holdings: p.holdings
    })
  )

  return withLatency(withFailureRate<PortfolioRepo>({
    async getById(id) {
      return store.find((p) => p.id === id) ?? null
    },
    async byOwnerId(userId) {
      return store.find((p) => p.ownerId === userId) ?? null
    }
  }))
}

export const makeFlakyCompliance = (): Compliance =>
  withLatency(withFailureRate<Compliance>({
    async approve(p: PromptSuggestionDTO) {
      return p
    }
  }))
