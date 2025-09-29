import type { MarketSnapshotDTO } from "@template/contracts"

export interface MarketData {
  loadSnapshot(): Promise<MarketSnapshotDTO>
}
