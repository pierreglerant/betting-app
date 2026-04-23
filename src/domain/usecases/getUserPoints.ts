import type { UserRepository } from '../repositories/UserRepository';

export async function getUserPointsUseCase(repo: UserRepository, userId: string): Promise<number> {
  if (!userId?.trim()) {
    throw new Error('User id is required');
  }

  return repo.getUserPoints(userId.trim());
}
