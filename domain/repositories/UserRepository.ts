import { User } from '../entities/User';

export interface UserRepository {
  getUserByUsername(username: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
}
