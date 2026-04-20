import { Bet } from '@/domain/entities/Bet';
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
  const { data, error } = await supabase.rpc('get_bet_options', { bet_id: betId });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getBetParticipantsByBetId(betId: string) {
  const { data, error } = await supabase
    .from('user_bet')
    .select(
      `
        id,
        user_id,
        bet_id,
        points,
        updated_at,
        is_creator,
        option_id,
        user:user_id ( id, username ),
        option:option_id ( id, value )
      `,
    )
    .eq('bet_id', betId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function placeBet(userId: string, betId: string, optionId: number, points: number) {
  const { data, error } = await supabase.rpc('place_bet', {
    p_user_id: userId,
    p_bet_id: betId,
    p_option_id: optionId,
    p_points: points,
  });

  if (error) {
    throw error;
  }

  if (data == null) {
    throw new Error('place_bet failed');
  }

  return data as string;
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

export async function resolveBet(betId: string, winningValue: string) {
  const { error } = await supabase.rpc('resolve_bet', {
    p_bet_id: betId,
    p_winning_value: winningValue,
  });

  if (error) {
    throw error;
  }
}

export async function deleteBetById(betId: string, requesterId: string) {
  const { error } = await supabase.rpc('delete_bet', {
    p_bet_id: betId,
    p_requester_id: requesterId,
  });

  if (error) {
    throw error;
  }
}
