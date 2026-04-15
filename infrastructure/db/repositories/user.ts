import { getUserByUsername, getUsers } from '../dao/user';
import { mapUser } from '../mappers/user';

export const userRepository = {
  async getUserByUsername(username: string) {
    const data = await getUserByUsername(username);
    return mapUser(data);
  },

  async getAllUsers() {
    const rows = await getUsers();
    return rows.filter((r) => r && typeof r === 'object' && r.id).map(mapUser);
  },
};
