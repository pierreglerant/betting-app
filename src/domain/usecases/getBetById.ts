import { BetRepository } from '../repositories/BetRepository';
import { Bet } from '../entities/Bet';

export async function getBetByIdUseCase(repo: BetRepository, id: string): Promise<Bet> {
  return repo.getBetById(id);
}
