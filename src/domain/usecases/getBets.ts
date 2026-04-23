import { BetRepository } from '../repositories/BetRepository';
import { Bet } from '../entities/Bet';

export async function getBetsUseCase(repo: BetRepository): Promise<Bet[]> {
  return repo.getBets();
}
