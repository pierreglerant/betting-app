import { useBets } from '@/presentation/hooks/useBets';
import { supabase } from '@/libs/supabase';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { partitionDomainBets } from '../utils/partitionBets';

export function useBetsBundle(userId: string | undefined, refreshKey: number) {
  const { bets: domainBets, loading, error, reload: reloadBets } = useBets({ autoLoad: false });
  const [predictedSet, setPredictedSet] = useState<Set<string>>(new Set());

  const fetchMeta = useCallback(async () => {
    if (!userId) {
      setPredictedSet(new Set());
      return;
    }

    const predictedRes = await supabase
      .from('user_bet')
      .select('bet_id')
      .eq('user_id', userId)
      .eq('is_creator', false);

    if (predictedRes.error) {
      console.error('Error fetching user_bet wagers:', predictedRes.error);
    }

    setPredictedSet(new Set((predictedRes.data || []).map((p) => p.bet_id)));
  }, [userId]);

  const reload = useCallback(async () => {
    await reloadBets();
    await fetchMeta();
  }, [reloadBets, fetchMeta]);

  useEffect(() => {
    void reload();
  }, [userId, refreshKey, reload]);

  const { openBets, myLaunchedBets, finishedBets } = useMemo(
    () => partitionDomainBets(domainBets, userId),
    [domainBets, userId],
  );

  return {
    openBets,
    myLaunchedBets,
    finishedBets,
    predictedSet,
    reload,
    loading,
    error,
  };
}
