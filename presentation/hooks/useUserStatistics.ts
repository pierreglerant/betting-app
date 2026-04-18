import { getUserStatisticsUseCase } from '@/domain/usecases/getUserStatistics';
import type { UserStatistics } from '@/domain/entities/UserStatistics';
import { userRepository } from '@/infrastructure/db/repositories/user';
import { useCallback, useState } from 'react';

export function useUserStatistics(userId: string | undefined) {
  const [stats, setStats] = useState<UserStatistics>({
    totalBets: 0,
    winRate: 0,
    ranking: 0,
  });

  const reload = useCallback(async () => {
    if (!userId?.trim()) {
      return;
    }

    try {
      const next = await getUserStatisticsUseCase(userRepository, userId);
      setStats(next);
    } catch (err) {
      console.error('Error fetching user statistics:', err);
    }
  }, [userId]);

  return { stats, reload };
}
