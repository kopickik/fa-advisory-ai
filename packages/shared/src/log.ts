export const log = (evt: string, meta: Record<string, unknown> = {}) =>
  console.log(JSON.stringify({ evt, ...meta, ts: new Date().toISOString() }))
