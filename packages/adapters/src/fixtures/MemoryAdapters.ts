// packages/adapters/src/fixtures/MemoryAdapters.ts
import type { MarketSnapshotDTO, PortfolioDTO, PromptSuggestionDTO, UserProfileDTO } from "@template/contracts"
import type { Portfolio } from "@template/domain"
import type { Compliance } from "../Compliance.port.js"
import type { MarketData } from "../MarketData.port.js"
import type { PortfolioRepo } from "../PortfolioRepo.port.js"
import type { ProfileRepo } from "../ProfileRepo.port.js"
import { toMutablePortfolio } from "./AdapterUtils.js" // <-- add if using separate helper

export const makeMemoryProfileRepo = (profiles: Array<UserProfileDTO>): ProfileRepo => ({
  async load(userId) {
    return profiles.find((p) => p.id === userId) ?? null
  }
})

/**
 * Accepts either domain Portfolios or DTO-shaped/readonly portfolios and
 * normalizes to the mutable domain `Portfolio` before storing/returning.
 */
export const makeMemoryPortfolioRepo = (
  portfolios: ReadonlyArray<Portfolio | PortfolioDTO>
): PortfolioRepo => {
  // normalize once at construction
  const store: Array<Portfolio> = portfolios.map((p) =>
    toMutablePortfolio({
      id: p.id,
      ownerId: p.ownerId,
      base: p.base as Portfolio["base"],
      holdings: p.holdings
    })
  )

  return {
    async getById(id) {
      return store.find((p) => p.id === id) ?? null
    },
    async byOwnerId(userId) {
      return store.find((p) => p.ownerId === userId) ?? null
    }
  }
}

export const makeMemoryMarketData = (snapshot: MarketSnapshotDTO): MarketData => ({
  async loadSnapshot() {
    return snapshot
  }
})

export const makePassThroughCompliance = (): Compliance => ({
  async approve(p: PromptSuggestionDTO) {
    return p
  }
})
