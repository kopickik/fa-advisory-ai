import tsconfigPaths from "vite-tsconfig-paths"
import { mergeConfig, type UserConfigExport } from "vitest/config"
import shared from "../../vitest.shared.ts"

const config: UserConfigExport = {
  plugins: [
    tsconfigPaths()
  ]
}

export default mergeConfig(shared, config)
