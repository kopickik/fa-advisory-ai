import "dotenv/config"
import cors from "@fastify/cors"
import swagger from "@fastify/swagger"
import swaggerUI from "@fastify/swagger-ui"
import { adviceRoutes } from "./routes/advice.routes.js"
import { portfolioRoutes } from "./routes/portfolio.routes.js"
import { promptsRoutes } from "./routes/prompts.routes.js"
import { buildServer } from "./server.js"

const app = buildServer()

app.get("/health", async () => ({ ok: true, ts: new Date().toISOString() }))

await app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
})

if (process.env.NODE_ENV !== "production") {
  await app.register(swagger, {
    openapi: {
      info: { title: "Finance Advisory AI API", version: "0.1.0" }
    }
  })

  await app.register(swaggerUI, { routePrefix: "/docs" })
}

await app.register(promptsRoutes)
await portfolioRoutes(app)
await adviceRoutes(app)

const port = Number(process.env.PORT ?? 3000)
await app.listen({ port, host: "0.0.0.0" })
console.log(`API listening on http://localhost:${port} | docs: /docs`)
