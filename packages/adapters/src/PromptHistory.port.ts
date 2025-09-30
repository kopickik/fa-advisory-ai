export interface PromptHistory {
  record(userId: string, dayKey: string, promptId: string): Promise<void>
  recent(userId: string, limit: number): Promise<ReadonlyArray<string>>
}
