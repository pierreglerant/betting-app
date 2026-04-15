import { getUserByUsername } from '../dao/user';
import { mapUser } from '../mappers/user';

export const userRepository = {
  async getUserByUsername(username: string) {
    const data = await getUserByUsername(username);
    return mapUser(data);
  },
};
