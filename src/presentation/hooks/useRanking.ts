import { useCallback, useEffect, useState } from 'react';

import type { User } from '@/domain/entities/User';
import { getRankingUseCase } from '@/domain/usecases/getRanking';
import { userRepository } from '@/infrastructure/db/repositories/user';

export function useRanking() {
  const [ranking, setRanking] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRanking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await getRankingUseCase(userRepository);
      setRanking(users);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching ranking';
      setError(message);
      console.error('Error fetching ranking:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRanking();
  }, [loadRanking]);

  return {
    ranking,
    loading,
    error,
    reload: loadRanking,
  };
}
