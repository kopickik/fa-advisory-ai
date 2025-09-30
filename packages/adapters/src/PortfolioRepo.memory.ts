import type { Portfolio } from "@template/domain"
import type { PortfolioRepo } from "./PortfolioRepo.port.js"

export const makeMemoryPortfolioRepo = (rows: ReadonlyArray<Portfolio>): PortfolioRepo => ({
  async getById(id) {
    return rows.find((p) => p.id === id) ?? null
  },
  async byOwnerId(userId) {
    return rows.find((p) => p.ownerId === userId) ?? null
  }
})
