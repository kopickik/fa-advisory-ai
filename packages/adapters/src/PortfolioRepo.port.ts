import type { Portfolio } from "@template/domain"

export interface PortfolioRepo {
  getById(id: string): Promise<Portfolio | null>
  byOwnerId(userId: string): Promise<Portfolio | null>
}
