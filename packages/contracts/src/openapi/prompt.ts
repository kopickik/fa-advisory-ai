import type { OpenAPISchema } from "./types.js"

export const getPromptsTodaySchema: OpenAPISchema = {
  summary: "Get today's 3 personalized prompts",
  description: "Returns three prompts tailored by profile, portfolio, and current market.",
  tags: ["Prompts"],
  querystring: {
    type: "object",
    properties: { userId: { type: "string", description: "User ID" } },
    required: ["userId"],
    additionalProperties: false
  },
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          kind: { type: "string" },
          title: { type: "string" },
          body: { type: "string" },
          score: { type: "number" },
          reasons: { type: "array", items: { type: "string" } },
          actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                payload: { type: "object", additionalProperties: true }
              },
              required: ["type", "payload"],
              additionalProperties: false
            }
          },
          complianceNote: { type: "string" }
        },
        required: ["id", "kind", "title", "body", "score", "reasons", "actions"]
      }
    }
  }
}
