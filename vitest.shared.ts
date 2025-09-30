import * as fs from "node:fs"
import * as path from "node:path"
import tsconfigPaths from "vite-tsconfig-paths"
import type { ViteUserConfig } from "vitest/config"

const tsconfig = path.resolve(__dirname, "tsconfig.base.json")

// "@template/adapters" -> "adapters"
const dirOf = (name: string) => (name.startsWith("@") ? name.split("/")[1] : name)

/**
 * Resolve a package base dir:
 * - If TEST_DIST is set AND packages/<pkg>/dist exists, use dist
 * - Otherwise use src
 */
const resolveBase = (name: string) => {
  const dir = dirOf(name)
  const dist = path.resolve(__dirname, `packages/${dir}/dist`)
  const src = path.resolve(__dirname, `packages/${dir}/src`)
  const wantDist = !!process.env.TEST_DIST && fs.existsSync(dist)
  return { base: wantDist ? dist : src, entry: wantDist ? "index.js" : "index.ts" }
}

/**
 * Create two aliases per package:
 *  1) exact id:  ^@template/adapters$      -> packages/adapters/<base>/<entry>
 *  2) subpath:   ^@template/adapters/(.*)  -> packages/adapters/<base>/$1
 */
const pkgAliases = (name: string) => {
  const { base, entry } = resolveBase(name)
  return [
    { find: new RegExp(`^${name}$`), replacement: path.join(base, entry) },
    { find: new RegExp(`^${name}/`), replacement: base + "/" }
  ] as const
}

const config: ViteUserConfig = {
  plugins: [
    // Honor root tsconfig "paths" (works for most cases)
    tsconfigPaths({ projects: [tsconfig] })
  ],
  test: {
    environment: "node",
    setupFiles: [path.join(__dirname, "setupTests.ts")],
    include: ["test/**/*.test.ts"],
    deps: { inline: [/^@template\//] },
    fakeTimers: { toFake: undefined },
    sequence: { concurrent: true }
  },
  resolve: {
    conditions: ["node", "import", "module", "default"],
    // Fallback aliases guarantee resolution even when tsconfig-paths
    // doesn’t kick in or TEST_DIST points at an unbuilt package.
    alias: [
      ...pkgAliases("@template/shared"),
      ...pkgAliases("@template/domain"),
      ...pkgAliases("@template/contracts"),
      ...pkgAliases("@template/adapters"),
      ...pkgAliases("@template/ai"),
      ...pkgAliases("@template/use-cases"),
      ...pkgAliases("@template/infra"),
      ...pkgAliases("@template/agents"),
      ...pkgAliases("@template/api")
    ]
  },
  esbuild: { target: "es2020" },
  optimizeDeps: { exclude: ["bun:sqlite"] }
}

export default config
