export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

export interface AdviceConstraint {
  prohibitedSymbols?: Array<string>
  minDiversification?: number // 0..1
  targetRisk?: RiskLevel
}

export interface AdvicePlan {
  planId: string
  ownerId: string
  summary: string
  actions: Array<{ type: "BUY" | "SELL" | "REBALANCE"; symbol?: string; note?: string }>
  rationale: Array<string>
}
