import type { UserBetRepository } from '@/domain/repositories/UserBetRepository';

import { getUserBetsByUserId } from '../dao/userBet';

export const userBetRepository: UserBetRepository = {
  async getPredictedBetIds(userId: string) {
    const rows = await getUserBetsByUserId(userId);
    return rows.map((row) => row.bet_id);
  },
};
