export const advicePrompt = (p: { ownerId: string; symbols: Array<string>; risk?: string; minDiv?: number }) =>
  `You are a fiduciary assistant. Owner=${p.ownerId}. Holdings=${p.symbols.join(",")}.
Risk=${p.risk ?? "N/A"} MinDiversification=${p.minDiv ?? "N/A"}.
Suggest a short, compliant summary and 3-7 concrete actions with rationale.`
