import type { BetParticipant } from '../entities/BetParticipant';
import type { BetRepository } from '../repositories/BetRepository';

export async function getBetParticipantsUseCase(
  repo: BetRepository,
  betId: string,
): Promise<BetParticipant[]> {
  const trimmedBetId = betId?.trim();

  if (!trimmedBetId) {
    return [];
  }

  return repo.getBetParticipants(trimmedBetId);
}
