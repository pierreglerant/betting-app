import { supabase } from '@/infrastructure/db/api/supabase';
import { Bet } from '@/domain/entities/Bet';

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
  const { data, error } = await supabase.rpc('get_bet_options', { bet_id: betId });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createBet(bet: Bet, optionValues: string[], creatorId: string) {
  // Ne pas omettre p_end_date : sinon PostgREST ne résout pas la surcharge à 5 arguments (PGRST202 / 404).
  const { data, error } = await supabase.rpc('create_bet', {
    p_title: bet.title,
    p_context: bet.context,
    p_end_date: bet.endDate != null ? bet.endDate.toISOString() : null,
    p_option_values: optionValues,
    p_creator_id: creatorId,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Failed to create bet');
  }

  return data;
}
