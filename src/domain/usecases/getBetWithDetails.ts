import { BetRepository } from '../repositories/BetRepository';
import { Comment } from '../entities/Comment';
import { Option } from '../entities/Option';
import { Bet } from '../entities/Bet';

export async function getBetWithDetailsUseCase(
  repo: BetRepository,
  id: string,
): Promise<Bet & { comments: Comment[]; options: Option[] }> {
  return repo.getBetWithDetails(id);
}
