import { useBets } from '@/presentation/hooks/useBets';
import { useUserPredictedBets } from '@/presentation/hooks/useUserPredictedBets';
import { useCallback, useEffect, useMemo } from 'react';
import { partitionDomainBets } from '../utils/partitionBets';

export function useBetsBundle(userId: string | undefined, refreshKey: number) {
  const { bets: domainBets, loading, error, reload: reloadBets } = useBets({ autoLoad: false });
  const { predictedBetIds, loadPredictedBets } = useUserPredictedBets(userId);

  const predictedSet = useMemo(() => new Set(predictedBetIds), [predictedBetIds]);

  const reload = useCallback(async () => {
    await reloadBets();
    await loadPredictedBets();
  }, [reloadBets, loadPredictedBets]);

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
