import { useCallback, useState } from 'react';

import { getUserPredictedBetsUseCase } from '@/domain/usecases/getUserPredictedBets';
import { userBetRepository } from '@/infrastructure/db/repositories/userBet';

export function useUserPredictedBets(userId: string | undefined) {
  const [predictedBetIds, setPredictedBetIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPredictedBets = useCallback(async () => {
    if (!userId?.trim()) {
      setPredictedBetIds([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const ids = await getUserPredictedBetsUseCase(userBetRepository, userId);
      setPredictedBetIds(ids);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching predicted bets';
      setError(message);
      console.error('Error fetching predicted bets:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    predictedBetIds,
    loading,
    error,
    loadPredictedBets,
  };
}
