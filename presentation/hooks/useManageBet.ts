import { useState } from 'react';

import { deleteBetUseCase } from '@/domain/usecases/deleteBet';
import { resolveBetUseCase } from '@/domain/usecases/resolveBet';
import { betRepository } from '@/infrastructure/db/repositories/bet';

export function useManageBet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = async (betId: string, winningValue: string) => {
    try {
      setLoading(true);
      setError(null);
      await resolveBetUseCase(betRepository, betId, winningValue);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (betId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteBetUseCase(betRepository, betId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    resolve,
    remove,
    loading,
    error,
  };
}
