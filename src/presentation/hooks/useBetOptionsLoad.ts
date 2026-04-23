import { getBetOptionsForBetUseCase } from '@/domain/usecases/getBetOptionsForBet';
import type { Option } from '@/domain/entities/Option';
import { betRepository } from '@/infrastructure/db/repositories/bet';
import { useCallback, useRef, useState } from 'react';

export function useBetOptionsLoad() {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadSeq = useRef(0);

  const load = useCallback(async (betId: string) => {
    const id = ++loadSeq.current;
    setLoading(true);
    setError(null);
    try {
      const opts = await getBetOptionsForBetUseCase(betRepository, betId);
      if (id !== loadSeq.current) return;
      setOptions(opts);
    } catch (err) {
      if (id !== loadSeq.current) return;
      const message = err instanceof Error ? err.message : 'Error';
      setError(message);
      setOptions([]);
    } finally {
      if (id === loadSeq.current) {
        setLoading(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    setOptions([]);
    setError(null);
  }, []);

  return { options, loading, error, load, reset };
}
