import type { AvatarStorage } from '../repositories/AvatarStorage';
import type { ProfileRepository } from '../repositories/ProfileRepository';

export interface UpdateProfileInput {
  userId: string;
  username?: string;
  avatarBase64?: string;
  avatarMimeType?: string;
}

export interface UpdateProfileResult {
  username?: string;
  avatarUrl?: string;
}

export async function updateProfileUseCase(
  profileRepository: ProfileRepository,
  avatarStorage: AvatarStorage,
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const userId = input.userId?.trim();

  if (!userId) {
    throw new Error('User id is required');
  }

  const nextUsername = input.username?.trim();
  const hasAvatar = !!input.avatarBase64?.trim();

  if (!nextUsername && !hasAvatar) {
    throw new Error('At least one profile field is required');
  }

  const result: UpdateProfileResult = {};

  if (nextUsername) {
    await profileRepository.updateUsername(userId, nextUsername);
    result.username = nextUsername;
  }

  if (hasAvatar && input.avatarBase64) {
    const avatarUrl = await avatarStorage.uploadAvatar(
      userId,
      input.avatarBase64,
      input.avatarMimeType,
    );
    await profileRepository.updateAvatarUrl(userId, avatarUrl);
    result.avatarUrl = avatarUrl;
  }

  return result;
}
