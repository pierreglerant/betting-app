import { placeBetUseCase } from '@/domain/usecases/placeBet';
import { betRepository } from '@/infrastructure/db/repositories/bet';
import { useState } from 'react';

export function usePlaceBet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const place = async (userId: string, betId: string, optionId: number, points: number) => {
    try {
      setLoading(true);
      setError(null);

      const id = await placeBetUseCase(betRepository, userId, betId, optionId, points);

      return id;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    place,
    loading,
    error,
  };
}
