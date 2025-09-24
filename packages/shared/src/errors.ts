export type AppError =
  | { kind: "Forbidden"; msg: string }
  | { kind: "Invalid"; msg: string; details?: unknown }
  | { kind: "NotFound"; msg: string }
  | { kind: "Failure"; msg: string }

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
