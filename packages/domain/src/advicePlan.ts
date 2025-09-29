export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

export interface AdviceConstraint {
  prohibitedSymbols?: ReadonlyArray<string>
  minDiversification?: number // 0..1
  targetRisk?: RiskLevel
}

export interface AdvicePlan {
  summary: string
  steps: ReadonlyArray<{ title: string; detail: string }>
}
