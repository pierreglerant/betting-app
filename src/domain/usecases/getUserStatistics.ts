import type { UserStatistics } from '../entities/UserStatistics';
import type { UserRepository } from '../repositories/UserRepository';

export async function getUserStatisticsUseCase(
  repo: UserRepository,
  userId: string,
): Promise<UserStatistics> {
  if (!userId?.trim()) {
    throw new Error('User id is required');
  }

  return repo.getUserStatistics(userId.trim());
}
