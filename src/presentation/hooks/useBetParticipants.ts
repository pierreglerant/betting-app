import { useCallback, useEffect, useState } from 'react';

import type { BetParticipant } from '@/domain/entities/BetParticipant';
import { getBetParticipantsUseCase } from '@/domain/usecases/getBetParticipants';
import { betRepository } from '@/infrastructure/db/repositories/bet';

export function useBetParticipants(betId: string | undefined) {
  const [participants, setParticipants] = useState<BetParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadParticipants = useCallback(async () => {
    if (!betId?.trim()) {
      setParticipants([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getBetParticipantsUseCase(betRepository, betId);
      setParticipants(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching participants';
      setError(message);
      console.error('Error fetching bet participants:', err);
    } finally {
      setLoading(false);
    }
  }, [betId]);

  useEffect(() => {
    void loadParticipants();
  }, [loadParticipants]);

  return {
    participants,
    loading,
    error,
    reload: loadParticipants,
  };
}
