import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type CreateBetPayload = {
  action: 'createBet';
  title: string;
  context: string | null;
  endDate: string | null;
  optionValues: string[];
  creatorId: string;
};

type ResolveBetPayload = {
  action: 'resolveBet';
  betId: string;
  winningValue: string;
};

type Payload = CreateBetPayload | ResolveBetPayload;

type PushUser = {
  id: string;
  expo_push_token: string;
};

function formatUnknownError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

export async function sendPushNotification(users: PushUser[], title: string, body: string) {
  const messages = users
    .filter((user) => user.expo_push_token)
    .map((user) => ({
      to: user.expo_push_token,
      sound: 'default',
      title,
      body,
    }));

  if (messages.length === 0) {
    return;
  }

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Expo push failed: ${response.status} ${errorBody}`);
  }
}

async function getPushUsers(userIds: string[]): Promise<PushUser[]> {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  if (uniqueUserIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_device')
    .select('user_id, push_token')
    .in('user_id', uniqueUserIds);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: String(row.user_id),
    expo_push_token: String(row.push_token),
  }));
}

async function getAllPushUsersExcept(excludedUserId: string): Promise<PushUser[]> {
  const { data, error } = await supabase
    .from('user_device')
    .select('user_id, push_token')
    .neq('user_id', excludedUserId);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: String(row.user_id),
    expo_push_token: String(row.push_token),
  }));
}

async function getBetParticipantIdsExceptCreator(
  betId: string,
  creatorId: string,
): Promise<string[]> {
  let query = supabase.from('user_bet').select('user_id').eq('bet_id', betId);

  if (creatorId) {
    query = query.neq('user_id', creatorId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => String(row.user_id));
}

async function getUsername(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('user')
    .select('username')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.username ? String(data.username) : 'Quelqu’un';
}

async function getBetCreatorId(betId: string): Promise<string> {
  const { data: bet, error: betError } = await supabase
    .from('bet')
    .select('creator_id')
    .eq('id', betId)
    .maybeSingle();

  if (betError) {
    throw betError;
  }

  if (bet?.creator_id) {
    return String(bet.creator_id);
  }

  const { data: creatorBet, error: creatorBetError } = await supabase
    .from('user_bet')
    .select('user_id')
    .eq('bet_id', betId)
    .eq('is_creator', true)
    .maybeSingle();

  if (creatorBetError) {
    throw creatorBetError;
  }

  return creatorBet?.user_id ? String(creatorBet.user_id) : '';
}

async function handleCreateBet(payload: CreateBetPayload) {
  const { data: betId, error } = await supabase.rpc('create_bet', {
    p_title: payload.title,
    p_context: payload.context,
    p_end_date: payload.endDate,
    p_option_values: payload.optionValues,
    p_creator_id: payload.creatorId,
  });

  if (error) {
    throw error;
  }

  if (!betId) {
    throw new Error('Failed to create bet');
  }

  try {
    const [username, users] = await Promise.all([
      getUsername(payload.creatorId),
      getAllPushUsersExcept(payload.creatorId),
    ]);

    await sendPushNotification(users, 'Nouveau pari 🍺', `${username} a lancé un pari`);
  } catch (error) {
    console.error('[bet-notifications] createBet push failed', error);
  }

  return { betId };
}

async function handleResolveBet(payload: ResolveBetPayload) {
  console.log('[bet-notifications] resolveBet:start', payload.betId);
  const creatorId = await getBetCreatorId(payload.betId);
  console.log('[bet-notifications] resolveBet:creator', creatorId);

  const { error } = await supabase.rpc('resolve_bet', {
    p_bet_id: payload.betId,
    p_winning_value: payload.winningValue,
  });

  if (error) {
    throw error;
  }

  console.log('[bet-notifications] resolveBet:rpc done');

  try {
    const participantIds = await getBetParticipantIdsExceptCreator(payload.betId, creatorId);
    const users =
      participantIds.length > 0
        ? await getPushUsers(participantIds)
        : creatorId
          ? await getAllPushUsersExcept(creatorId)
          : [];

    await sendPushNotification(users, 'Pari terminé ✅', 'Le résultat est disponible');
  } catch (error) {
    console.error('[bet-notifications] resolveBet push failed', error);
  }

  console.log('[bet-notifications] resolveBet:done');
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as Payload;
    console.log('[bet-notifications] received', payload.action);

    const result =
      payload.action === 'createBet'
        ? await handleCreateBet(payload)
        : await handleResolveBet(payload);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = formatUnknownError(error);
    console.error('[bet-notifications] failed', message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
