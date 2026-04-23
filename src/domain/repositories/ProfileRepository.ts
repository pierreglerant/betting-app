export interface ProfileRepository {
  updateUsername(userId: string, username: string): Promise<void>;
  updateAvatarUrl(userId: string, avatarUrl: string): Promise<void>;
}
