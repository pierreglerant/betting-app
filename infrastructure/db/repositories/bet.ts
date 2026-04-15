import { Bet } from '@/domain/entities/Bet';
import { getBetById, getBets, getBetCommentsByBetId, getBetOptionsByBetId, createBet} from '../dao/bet';

import { mapBet } from '../mappers/bet';
import { mapComment } from '../mappers/comment';
import { mapOption } from '../mappers/option';

export const betRepository = {
  async getBets() {
    const data = await getBets();
    return data.map(mapBet);
  },

  async getBetById(id: string) {
    const data = await getBetById(id);
    return mapBet(data);
  },

  async getBetWithDetails(id: string) {
    const [bet, comments, options] = await Promise.all([
      getBetById(id),
      getBetCommentsByBetId(id),
      getBetOptionsByBetId(id),
    ]);

    return {
      ...mapBet(bet),
      comments: comments.map(mapComment),
      options: options.map(mapOption),
    };
  },

  async createBet(bet: Bet, optionValues: string[]) {
    const data = await createBet(bet, optionValues);
    return data;
  },
};
