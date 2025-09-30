// packages/shared/src/createHandler.ts
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import type { FastifyReply, FastifyRequest } from "fastify"
import { type AppError, fromUnknown, toHttp } from "./errors.js"
import { type Result } from "./result.js"

// Use case returns Effect with no error channel and no required environment
export type UseCase<Q, Out> = (
  q: Q,
  ctx: unknown
) => Effect.Effect<Result<Out, AppError>, never, never>

/**
 * createHandler
 * - schema: Schema<Q, I> (Q = decoded; I = encoded-from-request)
 * - pick: FastifyRequest -> I (query/body/params)
 * - useCase: Effect<Result<Out, AppError>, never, never>
 */
export function createHandler<Q, I, Out>(
  schema: Schema.Schema<Q, I>,
  pick: (req: FastifyRequest) => I,
  useCase: UseCase<Q, Out>
) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    // 1) Decode synchronously; on failure, return HTTP error immediately
    let q: Q
    try {
      const decode = Schema.decodeUnknownSync(schema)
      q = decode(pick(req))
    } catch (e) {
      const out = toHttp(fromUnknown(e))
      return reply.status(out.statusCode).type("application/json").send(out.body)
    }

    // 2) Run the use case; it returns Result<Out, AppError> in Effect with E=never, R=never
    const result = await Effect.runPromise(useCase(q, req))

    // 3) Uniform HTTP response
    if (result.ok) {
      return reply.status(200).type("application/json").send(result.value)
    } else {
      const out = toHttp(result.error)
      return reply.status(out.statusCode).type("application/json").send(out.body)
    }
  }
}
