import { useCallback, useEffect, useState } from 'react';
import { Bet } from '@/domain/entities/Bet';
import { getBetsUseCase } from '@/domain/usecases/getBets';
import { betRepository } from '@/infrastructure/db/repositories/bet';

export function useBets() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getBetsUseCase(betRepository);
      setBets(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  return {
    bets,
    loading,
    error,
    reload: fetchBets,
  };
}
