import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import fastify from "fastify"

export const buildServer = () => {
  const app = fastify({ logger: true })
    .withTypeProvider<TypeBoxTypeProvider>()
  return app
}
