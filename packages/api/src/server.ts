import fastify from "fastify"

export const buildServer = () => {
  const app = fastify({ logger: process.env.NODE_ENV !== "production" })
  return app
}
