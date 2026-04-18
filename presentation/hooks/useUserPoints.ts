import { getUserPointsUseCase } from '@/domain/usecases/getUserPoints';
import { userRepository } from '@/infrastructure/db/repositories/user';
import { useCallback, useState } from 'react';

export function useUserPoints(userId: string | undefined) {
  const [points, setPoints] = useState(0);

  const reload = useCallback(async () => {
    if (!userId?.trim()) {
      return;
    }

    try {
      const next = await getUserPointsUseCase(userRepository, userId);
      setPoints(next);
    } catch (err) {
      console.error('Error fetching user points:', err);
    }
  }, [userId]);

  return { points, reload };
}
