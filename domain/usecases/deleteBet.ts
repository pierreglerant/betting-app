import type { BetRepository } from '../repositories/BetRepository';

export async function deleteBetUseCase(repo: BetRepository, betId: string): Promise<void> {
  const trimmedBetId = betId?.trim();

  if (!trimmedBetId) {
    throw new Error('Bet id is required');
  }

  await repo.deleteBet(trimmedBetId);
}
