import type { SupabaseClient } from '@supabase/supabase-js';

export type BetOptionRow = {
  id: number;
  value: string;
};

function coerceOptionId(raw: unknown): number {
  if (typeof raw === 'bigint') return Number(raw);
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return NaN;
}

function rowToOption(row: Record<string, unknown>): BetOptionRow | null {
  const rawId = row.id ?? row.Id;
  const rawVal = row.value ?? row.Value;
  const id = coerceOptionId(rawId);
  const value = String(rawVal ?? '').trim();
  if (!Number.isFinite(id) || value.length === 0) return null;
  return { id, value };
}

function normalizeRows(data: unknown): BetOptionRow[] {
  const rows = Array.isArray(data) ? data : data != null && typeof data === 'object' ? [data] : [];
  const out: BetOptionRow[] = [];
  for (const r of rows) {
    if (r && typeof r === 'object') {
      const o = rowToOption(r as Record<string, unknown>);
      if (o) out.push(o);
    }
  }
  return out;
}

/**
 * Options d'un pari : RPC puis, si vide ou erreur, lecture table `option`
 * (RLS / format SETOF composite peuvent faire renvoyer [] sans erreur).
 */
export async function fetchBetOptions(
  client: SupabaseClient,
  betId: string,
): Promise<{ options: BetOptionRow[]; error: string | null }> {
  // Uniquement `bet_id` : pas de surcharge `p_bet_id` côté DB → évite PGRST202 / schema cache.
  const { data, error: rpcError } = await client.rpc('get_bet_options', { bet_id: betId });
  let lastMessage: string | null = rpcError?.message ?? null;

  if (!rpcError) {
    const fromRpc = normalizeRows(data);
    if (fromRpc.length > 0) {
      return { options: fromRpc, error: null };
    }
  }

  const { data: tableRows, error: tableErr } = await client
    .from('option')
    .select('id, value')
    .eq('bet_id', betId)
    .order('id', { ascending: true });

  if (!tableErr && tableRows != null && tableRows.length > 0) {
    return { options: normalizeRows(tableRows), error: null };
  }

  if (tableErr) {
    const msg = [lastMessage, tableErr.message].filter(Boolean).join(' · ');
    return {
      options: [],
      error: msg || 'Impossible de charger les options',
    };
  }

  const hint =
    '0 ligne renvoyée : vérifie en base des lignes dans public.option pour ce pari, exécute supabase/sql/fix_option_access.sql (get_bet_options en security definer + policy SELECT sur option).';

  return {
    options: [],
    error: lastMessage ?? hint,
  };
}
