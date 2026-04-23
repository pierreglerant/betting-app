import type { BetRepository } from '../repositories/BetRepository';

export async function resolveBetUseCase(
  repo: BetRepository,
  betId: string,
  winningValue: string,
): Promise<void> {
  const trimmedBetId = betId?.trim();
  const trimmedWinningValue = winningValue?.trim();

  if (!trimmedBetId) {
    throw new Error('Bet id is required');
  }

  if (!trimmedWinningValue) {
    throw new Error('Winning value is required');
  }

  await repo.resolveBet(trimmedBetId, trimmedWinningValue);
}
