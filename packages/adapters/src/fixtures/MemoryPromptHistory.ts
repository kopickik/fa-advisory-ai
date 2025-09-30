import type { PromptHistory } from "../PromptHistory.port.js"

export const makeMemoryPromptHistory = (): PromptHistory => {
  const byUser = new Map<string, Array<string>>() // most recent first
  return {
    async record(userId, _day, promptId) {
      const list = byUser.get(userId) ?? []
      if (!list.includes(promptId)) {
        list.unshift(promptId)
        byUser.set(userId, list.slice(0, 200)) // keep last 200
      }
    },
    async recent(userId, limit) {
      return (byUser.get(userId) ?? []).slice(0, limit)
    }
  }
}
