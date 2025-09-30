import type { PromptSuggestionDTO } from "@template/contracts"

export interface Compliance {
  approve(prompt: PromptSuggestionDTO): Promise<PromptSuggestionDTO | null>
}
