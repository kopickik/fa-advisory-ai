import type { UserProfileDTO } from "@template/contracts"

export interface ProfileRepo {
  load(userId: string): Promise<UserProfileDTO | null>
}
