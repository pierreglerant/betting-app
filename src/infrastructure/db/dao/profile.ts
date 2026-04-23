import { supabase } from '@/infrastructure/db/api/supabase';

export async function updateUsername(userId: string, username: string) {
  const { error } = await supabase.from('user').update({ username }).eq('id', userId);

  if (error) {
    throw error;
  }
}

export async function updateAvatarUrl(userId: string, avatarUrl: string) {
  const { error } = await supabase.from('user').update({ avatar_url: avatarUrl }).eq('id', userId);

  if (error) {
    throw error;
  }
}
