import type { AdviceConstraint, AdvicePlan, Portfolio } from "@template/domain"
import type { AiService } from "./AiService.port.js"

export const makeOpenAiService = (): AiService => ({
  async draftAdvice(
    { constraints, portfolio }: { constraints: AdviceConstraint; portfolio: Portfolio }
  ): Promise<AdvicePlan> {
    // Stub: replace with real LLM call (OpenAI/Bedrock) via env & client
    const symbols = portfolio.holdings.map((h) => h.symbol)
    return {
      summary: `Draft plan considering constraints=${JSON.stringify(constraints)} for ${symbols.join(",")}`,
      steps: [
        { title: "Assess", detail: "Check drift & cash drag" },
        { title: "Propose", detail: "Suggest rebalance & auto-invest cadence" },
        { title: "Review", detail: "Show tax impact simulation" }
      ]
    }
  }
})
