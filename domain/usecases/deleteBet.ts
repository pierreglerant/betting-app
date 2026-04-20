import type { BetRepository } from '../repositories/BetRepository';

export async function deleteBetUseCase(
  repo: BetRepository,
  betId: string,
  requesterId: string,
): Promise<void> {
  const trimmedBetId = betId?.trim();
  const trimmedRequesterId = requesterId?.trim();

  if (!trimmedBetId) {
    throw new Error('Bet id is required');
  }

  if (!trimmedRequesterId) {
    throw new Error('Requester id is required');
  }

  await repo.deleteBet(trimmedBetId, trimmedRequesterId);
}
