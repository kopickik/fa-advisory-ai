export type AppError =
  | { kind: "Forbidden"; msg: string }
  | { kind: "Invalid"; msg: string; details?: unknown }
  | { kind: "NotFound"; msg: string }
  | { kind: "Failure"; msg: string }

export const isAppError = (e: unknown): e is AppError =>
  typeof e === "object" &&
  e !== null &&
  "kind" in e &&
  "msg" in e &&
  typeof (e as any).kind === "string" &&
  typeof (e as any).msg === "string"

export const fromUnknown = (
  e: unknown,
  opts?: { invalidMsg?: string; fallbackMsg?: string }
): AppError => {
  if (isAppError(e)) return e

  // Heuristics for validatino/parse errors (e.g., @effect/schema)
  const name = typeof e === "object" && e !== null ? (e as any).name : undefined
  const hasIssues = typeof e === "object" && e !== null && ("issues" in (e as any) || "errors" in (e as any))

  if (name === "ParseError" || hasIssues) {
    return {
      kind: "Invalid",
      msg: opts?.invalidMsg ?? "Invalid input",
      details: e
    }
  }

  if (e instanceof Error) return { kind: "Failure", msg: e.message }
  if (typeof e === "string") return { kind: "Failure", msg: e }
  return { kind: "Failure", msg: opts?.fallbackMsg ?? "Unexpected failure" }
}

export const toHttp = (e: AppError) => {
  switch (e.kind) {
    case "Forbidden":
      return { statusCode: 403, body: { error: e.msg } }
    case "Invalid":
      return { statusCode: 422, body: { error: e.msg, details: e.details } }
    case "NotFound":
      return { statusCode: 404, body: { error: e.msg } }
    default:
      return { statusCode: 500, body: { error: e.msg } }
  }
}
