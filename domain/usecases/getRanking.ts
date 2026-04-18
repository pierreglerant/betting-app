import type { UserRepository } from '../repositories/UserRepository';

export async function getRankingUseCase(repo: UserRepository) {
  return repo.getRanking();
}
