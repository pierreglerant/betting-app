import { BetRepository } from '../repositories/BetRepository';

export async function placeBetUseCase(
  repo: BetRepository,
  userId: string,
  betId: string,
  optionId: number,
  points: number,
) {
  if (!userId?.trim()) {
    throw new Error('User id is required');
  }

  if (!betId?.trim()) {
    throw new Error('Bet id is required');
  }

  if (!Number.isFinite(optionId)) {
    throw new Error('Invalid option');
  }

  if (!Number.isFinite(points) || points <= 0) {
    throw new Error('Points must be > 0');
  }

  if (points > 32767) {
    throw new Error('Points too large');
  }

  return repo.placeBet(userId.trim(), betId.trim(), optionId, points);
}
