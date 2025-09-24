// packages/shared/src/createHandler.ts
import * as S from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { type AppError, toHttp } from "./errors.js"
import type { Result } from "./result.js"

// Helpers to extract Encoded/Decoded from a Schema value (no From/To/Type/Infer needed)
type EncodedOf<T extends S.Schema<any, any, any>> = T extends S.Schema<infer I, any, any> ? I : never
type DecodedOf<T extends S.Schema<any, any, any>> = T extends S.Schema<any, infer A, any> ? A : never

type UseCase<Input, Output> = (q: Input, ctx: any) => Effect.Effect<Result<Output, AppError>, never>

/**
 * Bind types to the schema value:
 *  - TSchema must require no env (R = never)
 *  - pick(req) returns the schema's Encoded input
 *  - useCase receives the Decoded value
 */
export const createHandler = <TSchema extends S.Schema<any, any, never>, Out>(
  schema: TSchema,
  pick: (req: any) => EncodedOf<TSchema>,
  useCase: UseCase<DecodedOf<TSchema>, Out>
) =>
async (req: any, reply: any) => {
  return Effect.runPromise(
    Effect.gen(function*() {
      // Decode Encoded -> Decoded (Effect<DecodedOf<TSchema>, ParseError, never>)
      const q = yield* S.decode(schema)(pick(req))

      // Run use-case (Effect<Result<Out, AppError>, never>)
      const result = yield* useCase(q, req)

      if (!result.ok) {
        const out = toHttp(result.error)
        return reply.status(out.statusCode).type("application/json").send(out.body)
      }
      return reply.status(200).type("application/json").send(result.value)
    }).pipe(
      // Validation errors → 422
      Effect.catchAll((parseError) =>
        Effect.sync(() => {
          const out = toHttp({ kind: "Invalid", msg: "Invalid request", details: parseError })
          return reply.status(out.statusCode).type("application/json").send(out.body)
        })
      )
    )
  )
}
