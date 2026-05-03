export interface AvatarStorage {
  uploadAvatar(userId: string, base64: string, mimeType?: string): Promise<string>;
}
