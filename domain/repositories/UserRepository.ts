import { User } from '../entities/User';
import type { UserStatistics } from '../entities/UserStatistics';

export interface UserRepository {
  getUserByUsername(username: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUserStatistics(userId: string): Promise<UserStatistics>;
  getUserPoints(userId: string): Promise<number>;
}
