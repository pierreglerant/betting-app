import { useState } from 'react';
import { createBetUseCase } from '@/domain/usecases/createBet';
import { betRepository } from '@/infrastructure/db/repositories/bet';
import { Bet } from '@/domain/entities/Bet';

export function useCreateBet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (bet: Bet, options: string[], creatorId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[createBet] hook:start', { creatorId, title: bet.title });

      const id = await createBetUseCase(betRepository, bet, options, creatorId);
      console.log('[createBet] hook:done', { id });

      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error';
      console.error('[createBet] hook:error', err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    loading,
    error,
  };
}
