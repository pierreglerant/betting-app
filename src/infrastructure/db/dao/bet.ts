import { Bet } from '@/domain/entities/Bet';
import { supabase } from '@/infrastructure/db/api/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

async function invokeBetNotifications<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${supabaseUrl}/functions/v1/bet-notifications`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const responseBody = await response.text();
  const data = responseBody ? JSON.parse(responseBody) : null;

  if (!response.ok) {
    throw new Error(data?.error ?? `bet-notifications failed with status ${response.status}`);
  }

  return data as T;
}

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
  console.log('[createBet] edge invoke:start', { creatorId, title: bet.title });

  const data = await invokeBetNotifications<{ betId: string }>({
    action: 'createBet',
    title: bet.title,
    context: bet.context,
    endDate: bet.endDate != null ? bet.endDate.toISOString() : null,
    optionValues,
    creatorId,
  });

  console.log('[createBet] edge invoke:response', data);

  if (!data?.betId) {
    throw new Error('Failed to create bet');
  }

  return data.betId as string;
}

export async function resolveBet(betId: string, winningValue: string) {
  console.log('[resolveBet] edge invoke:start', { betId });

  await invokeBetNotifications<{ ok: true }>({
    action: 'resolveBet',
    betId,
    winningValue,
  });

  console.log('[resolveBet] edge invoke:done', { betId });
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
