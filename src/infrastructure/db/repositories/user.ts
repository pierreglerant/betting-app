import {
  getRanking,
  getUserByUsername,
  getUserPoints,
  getUserStatistics,
  getUsers,
} from '../dao/user';
import { mapUser } from '../mappers/user';
import { mapUserStatisticsDto } from '../mappers/userStatistics';

function hasUserId(row: unknown): row is { id: unknown } & Record<string, unknown> {
  return Boolean(row && typeof row === 'object' && 'id' in row && row.id);
}

export const userRepository = {
  async getUserByUsername(username: string) {
    const data = await getUserByUsername(username);
    return mapUser(data);
  },

  async getAllUsers() {
    const rows = await getUsers();
    return rows.filter(hasUserId).map(mapUser);
  },

  async getRanking() {
    const rows = await getRanking();
    return rows.filter(hasUserId).map(mapUser);
  },

  async getUserStatistics(userId: string) {
    const row = await getUserStatistics(userId);
    return mapUserStatisticsDto(row);
  },

  async getUserPoints(userId: string) {
    return getUserPoints(userId);
  },
};
