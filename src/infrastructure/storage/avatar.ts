import { decode } from 'base64-arraybuffer';

import type { AvatarStorage } from '@/domain/repositories/AvatarStorage';
import { supabase } from '@/infrastructure/db/api/supabase';

function getAvatarExtension(mimeType?: string) {
  if (mimeType === 'image/png') {
    return 'png';
  }

  if (mimeType === 'image/webp') {
    return 'webp';
  }

  return 'jpg';
}

export const avatarStorage: AvatarStorage = {
  async uploadAvatar(userId: string, base64: string, mimeType?: string) {
    const normalizedMimeType = mimeType || 'image/jpeg';
    const filePath = `${userId}.${getAvatarExtension(normalizedMimeType)}`;
    const fileBuffer = decode(base64);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileBuffer, {
        upsert: true,
        contentType: normalizedMimeType,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

    return data.publicUrl;
  },
};
