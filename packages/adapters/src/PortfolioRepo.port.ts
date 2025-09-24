import type { Portfolio } from "@domain"

export interface PortfolioRepo {
  getById(id: string): Promise<Portfolio | null>
}
