import { useCallback, useEffect, useState } from 'react';
import { getBetWithDetailsUseCase } from '@/domain/usecases/getBetWithDetails';
import { betRepository } from '@/infrastructure/db/repositories/bet';
import { Bet } from '@/domain/entities/Bet';
import { Comment } from '@/domain/entities/Comment';
import { Option } from '@/domain/entities/Option';

type BetDetails = Bet & {
  comments: Comment[];
  options: Option[];
};

export function useBetDetails(betId: string) {
  const [bet, setBet] = useState<BetDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBetDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getBetWithDetailsUseCase(betRepository, betId);
      setBet(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [betId]);

  useEffect(() => {
    if (!betId) return;
    fetchBetDetails();
  }, [betId, fetchBetDetails]);

  return {
    bet,
    loading,
    error,
    reload: fetchBetDetails,
  };
}
