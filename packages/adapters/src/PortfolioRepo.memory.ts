import type { Portfolio } from "@template/domain"
import type { PortfolioRepo } from "./PortfolioRepo.port.ts"

export const makeMemoryPortfolioRepo = (seed: Array<Portfolio>): PortfolioRepo => {
  const byId = new Map(seed.map((p) => [p.id, p]))
  return { getById: async (id: string) => byId.get(id) ?? null }
}
