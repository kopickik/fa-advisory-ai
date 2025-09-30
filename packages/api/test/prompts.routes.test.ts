import Fastify from "fastify"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { promptsRoutes } from "../src/routes/prompts.routes.js"

describe("GET /prompts/today", () => {
  const app = Fastify({ logger: false })

  beforeAll(async () => {
    await app.register(promptsRoutes)
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })

  it("returns three prompts for valid user", async () => {
    const res = await app.inject({ method: "GET", url: "/prompts/today?userId=u-1" })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(3)
    // stable shape
    expect(body[0]).toHaveProperty("kind")
    expect(body[0]).toHaveProperty("actions")
  })

  it("returns empty array for unknown user", async () => {
    const res = await app.inject({ method: "GET", url: "/prompts/today?userId=unknown" })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual([])
  })
})
