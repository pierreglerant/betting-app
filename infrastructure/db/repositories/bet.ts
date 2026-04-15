import { Bet } from '@/domain/entities/Bet';
import {
  getBetById,
  getBets,
  getBetCommentsByBetId,
  getBetOptionsByBetId,
  createBet,
  placeBet as placeBetDao,
} from '../dao/bet';
import { getBetOptionsWithFallback } from '../dao/betOptions';

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

  async createBet(bet: Bet, optionValues: string[], creatorId: string) {
    const data = await createBet(bet, optionValues, creatorId);
    return data;
  },

  async getBetOptionsForBet(betId: string) {
    const { options, error } = await getBetOptionsWithFallback(betId);
    if (error) {
      throw new Error(error);
    }
    return options.map((o) => ({
      id: String(o.id),
      betId,
      value: o.value,
    }));
  },

  async placeBet(userId: string, betId: string, optionId: number, points: number) {
    return placeBetDao(userId, betId, optionId, points);
  },
};
