import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/User';

export async function getUserByUsernameUseCase(
  repo: UserRepository,
  username: string,
): Promise<User> {
  return repo.getUserByUsername(username);
}
