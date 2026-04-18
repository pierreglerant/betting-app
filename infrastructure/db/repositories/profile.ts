import type { ProfileRepository } from '@/domain/repositories/ProfileRepository';

import { updateAvatarUrl, updateUsername } from '../dao/profile';

export const profileRepository: ProfileRepository = {
  async updateUsername(userId: string, username: string) {
    await updateUsername(userId, username);
  },

  async updateAvatarUrl(userId: string, avatarUrl: string) {
    await updateAvatarUrl(userId, avatarUrl);
  },
};
