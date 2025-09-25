import type { FastifySchema } from "fastify"

export type OpenAPISchema = FastifySchema & {
  summary?: string
  description?: string
  tags?: Array<string>
  operationId?: string
  deprecated?: boolean
  security?: Array<unknown>
}
