import { supabase } from '@/infrastructure/db/api/supabase';

export async function getBetById(id: string) {
  const { data, error } = await supabase.rpc('get_bet', { id: id });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Bet not found');
  }

  return data;
}

export async function getBets() {
  const { data, error } = await supabase.rpc('get_bets');

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getBetCommentsByBetId(betId: string) {
  const { data, error } = await supabase.rpc('get_bet_comments', { p_bet_id: betId });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getBetOptionsByBetId(betId: string) {
  const { data, error } = await supabase.rpc('get_bet_options', { p_bet_id: betId });

  if (error) {
    throw error;
  }

  return data || [];
}
