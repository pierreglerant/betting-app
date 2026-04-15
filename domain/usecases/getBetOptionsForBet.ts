import { BetRepository } from '../repositories/BetRepository';

export async function getBetOptionsForBetUseCase(repo: BetRepository, betId: string) {
  if (!betId?.trim()) {
    throw new Error('Bet id is required');
  }

  return repo.getBetOptionsForBet(betId.trim());
}
