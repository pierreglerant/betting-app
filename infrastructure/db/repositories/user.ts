import {
  getRanking,
  getUserByUsername,
  getUserPoints,
  getUserStatistics,
  getUsers,
} from '../dao/user';
import { mapUser } from '../mappers/user';
import { mapUserStatisticsDto } from '../mappers/userStatistics';

export const userRepository = {
  async getUserByUsername(username: string) {
    const data = await getUserByUsername(username);
    return mapUser(data);
  },

  async getAllUsers() {
    const rows = await getUsers();
    return rows.filter((r) => r && typeof r === 'object' && r.id).map(mapUser);
  },

  async getRanking() {
    const rows = await getRanking();
    return rows.filter((r) => r && typeof r === 'object' && r.id).map(mapUser);
  },

  async getUserStatistics(userId: string) {
    const row = await getUserStatistics(userId);
    return mapUserStatisticsDto(row);
  },

  async getUserPoints(userId: string) {
    return getUserPoints(userId);
  },
};
