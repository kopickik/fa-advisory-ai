import * as path from "node:path"
import tsconfigPaths from "vite-tsconfig-paths"
import type { ViteUserConfig } from "vitest/config"

const ROOT = __dirname
const TARGET = process.env.TEST_DIST ? "dist" : "src"

// "@template/adapters" -> "adapters"
const dirOf = (name: string) => (name.startsWith("@") ? name.split("/")[1] : name)

const pkgAliases = (name: string) => {
  const dir = dirOf(name)
  const base = path.resolve(ROOT, "packages", dir, TARGET)
  return [
    // exact import: @template/adapters
    { find: new RegExp(`^${name}$`), replacement: path.join(base, "index.ts") },
    // deep import: @template/adapters/whatever
    { find: new RegExp(`^${name}/`), replacement: base + "/" }
  ] as const
}

const config: ViteUserConfig = {
  plugins: [
    // Optional: honors tsconfig.base.json "paths" for editor + vite
    tsconfigPaths({ projects: [path.resolve(ROOT, "tsconfig.base.json")] })
  ],
  test: {
    environment: "node",
    setupFiles: [path.join(ROOT, "setupTests.ts")],
    include: ["test/**/*.test.ts"],
    // ⚠️ Vitest 3: move inline -> server.deps.inline
    // (ensures workspace pkgs are bundled, not externalized)
    deps: {
      inline: [/^@template\//]
    },
    projects: ["packages/*"],
    sequence: { concurrent: true }
    // If you pin projects at package level, keep that in each package’s vitest.config.ts
  },
  resolve: {
    conditions: ["node", "import", "module", "default"],
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
    ],
    preserveSymlinks: false
  },
  esbuild: { target: "es2020" },
  optimizeDeps: {
    exclude: ["bun:sqlite"]
  },
  ssr: {
    noExternal: [/^@template\//]
  }
}

export default config
