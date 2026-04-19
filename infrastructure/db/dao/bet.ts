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

export async function deleteBetById(betId: string) {
  const { data: userBets, error: userBetsError } = await supabase
    .from('user_bet')
    .select('id, user_id, points, is_creator')
    .eq('bet_id', betId);

  if (userBetsError) {
    throw userBetsError;
  }

  // Remboursement: recrédite chaque utilisateur à hauteur des points misés sur ce pari.
  const refundsByUserId = new Map<string, number>();
  for (const row of userBets ?? []) {
    if (row.is_creator) {
      continue;
    }

    const userId = typeof row.user_id === 'string' ? row.user_id : '';
    const stakedPoints = Number(row.points ?? 0);
    if (!userId || !Number.isFinite(stakedPoints) || stakedPoints <= 0) {
      continue;
    }

    refundsByUserId.set(userId, (refundsByUserId.get(userId) ?? 0) + stakedPoints);
  }

  if (refundsByUserId.size > 0) {
    const userIds = [...refundsByUserId.keys()];

    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('id, points')
      .in('id', userIds);

    if (usersError) {
      throw usersError;
    }

    const usersById = new Map<string, number>();
    for (const user of users ?? []) {
      usersById.set(String(user.id), Number(user.points ?? 0));
    }

    await Promise.all(
      userIds.map(async (userId) => {
        const currentPoints = usersById.get(userId) ?? 0;
        const refund = refundsByUserId.get(userId) ?? 0;
        const { error: updateError } = await supabase
          .from('user')
          .update({ points: currentPoints + refund })
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }
      }),
    );
  }

  const userBetIds = (userBets ?? []).map((row) => row.id).filter(Boolean);

  if (userBetIds.length > 0) {
    const { error: commentsError } = await supabase
      .from('comment')
      .delete()
      .in('user_bet_id', userBetIds);

    if (commentsError) {
      throw commentsError;
    }
  }

  const { error: userBetDeleteError } = await supabase
    .from('user_bet')
    .delete()
    .eq('bet_id', betId);

  if (userBetDeleteError) {
    throw userBetDeleteError;
  }

  const { error: betError } = await supabase.from('bet').delete().eq('id', betId);

  if (betError) {
    throw betError;
  }
}
