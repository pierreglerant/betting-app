import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

export async function getAllUsersUseCase(repo: UserRepository): Promise<User[]> {
  return repo.getAllUsers();
}
