import type { AdviceConstraint, AdvicePlan, Portfolio } from "@template/domain"

export interface AiService {
  draftAdvice(input: {
    portfolio: Portfolio
    constraints?: AdviceConstraint
  }): Promise<AdvicePlan>
}
