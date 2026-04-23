import { supabase } from '@/infrastructure/db/api/supabase';

export async function getUserBetsByUserId(userId: string) {
  const { data, error } = await supabase
    .from('user_bet')
    .select('bet_id')
    .eq('user_id', userId)
    .eq('is_creator', false);

  if (error) {
    throw error;
  }

  return data || [];
}
