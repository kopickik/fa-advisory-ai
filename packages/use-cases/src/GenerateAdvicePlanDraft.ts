import { ok } from "@shared"
import * as Effect from "effect/Effect"

export const GenerateAdvicePlanDraft = ({ ai: _ai, repo: _repo }: any) => (_q: any) =>
  Effect.succeed(
    ok({
      planId: crypto.randomUUID(),
      summary: "Draft advice (stub)",
      actions: [{ type: "REBALANCE" as const, note: "Shift 5% from overweight large-cap to bonds" }],
      rationale: ["Improve diversification", "Respect constraints"]
    })
  )
