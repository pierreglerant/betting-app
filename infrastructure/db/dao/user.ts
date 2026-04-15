import { supabase } from '@/infrastructure/db/api/supabase';

export async function getUserByUsername(username: string) {
  const { data, error } = await supabase.rpc('get_user', { p_username: username });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('User not found');
  }

  return data;
}
