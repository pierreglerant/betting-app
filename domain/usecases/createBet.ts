import { Bet } from '../entities/Bet';
import { BetRepository } from '../repositories/BetRepository';

export async function createBetUseCase(
  repo: BetRepository,
  bet: Bet,
  optionValues: string[]
) {
  if (optionValues.length < 2) {
    throw new Error('At least 2 options required');
  }

  return repo.createBet(bet, optionValues);
}