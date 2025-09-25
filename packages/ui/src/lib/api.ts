import * as Effect from "effect/Effect"
import * as S from "@effect/schema/Schema"

const Summary = S.Struct({
    portfolioId: S.String,
    ownerId: S.String,
    base: S.Literal("USD", "EUR", "GBP"),
    total: S.Number,
    diversify: S.Number
})

export type Summary = S.Schema.Type<typeof Summary>

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

export const getSummary = (id: string) =>
    Effect.tryPromise({
        try: () => fetch(`${API}/portfolio/summary?portfolioId=${encodeURIComponent(id)}`)
            .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))),
        catch: e => ({ _tag: "HttpError", msg: String(e)})
    }).pipe(
        Effect.flatMap(json => S.decode(Summary)(json))
    )
