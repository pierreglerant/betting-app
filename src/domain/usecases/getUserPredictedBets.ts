import type { UserBetRepository } from '../repositories/UserBetRepository';

export async function getUserPredictedBetsUseCase(
  repo: UserBetRepository,
  userId: string,
): Promise<string[]> {
  const trimmedUserId = userId?.trim();

  if (!trimmedUserId) {
    return [];
  }

  return repo.getPredictedBetIds(trimmedUserId);
}
