import { useBets } from '@/presentation/hooks/useBets';
import { supabase } from '@/libs/supabase';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { partitionDomainBets } from '../utils/partitionBets';

export function useBetsBundle(userId: string | undefined, refreshKey: number) {
  const { bets: domainBets, loading, error, reload: reloadBets } = useBets({ autoLoad: false });
  const [excludedSet, setExcludedSet] = useState<Set<string>>(new Set());
  const [predictedSet, setPredictedSet] = useState<Set<string>>(new Set());

  const fetchMeta = useCallback(async () => {
    if (!userId) {
      setExcludedSet(new Set());
      setPredictedSet(new Set());
      return;
    }

    const [excludedRes, predictedRes] = await Promise.all([
      supabase.from('bet_tags').select('bet_id').eq('user_id', userId),
      supabase.from('predictions').select('bet_id').eq('user_id', userId),
    ]);

    if (excludedRes.error) {
      console.error('Error fetching excluded bets:', excludedRes.error);
    }
    if (predictedRes.error) {
      console.error('Error fetching predictions:', predictedRes.error);
    }

    setExcludedSet(new Set((excludedRes.data || []).map((e) => e.bet_id)));
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
    excludedSet,
    predictedSet,
    reload,
    loading,
    error,
  };
}
