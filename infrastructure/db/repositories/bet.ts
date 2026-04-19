import { Bet } from '@/domain/entities/Bet';
import type { BetRepository } from '@/domain/repositories/BetRepository';
import {
  createBet,
  deleteBetById,
  getBetById,
  getBetCommentsByBetId,
  getBetParticipantsByBetId,
  getBetOptionsByBetId,
  getBets,
  placeBet as placeBetDao,
  resolveBet as resolveBetDao,
} from '../dao/bet';
import { getBetOptionsWithFallback } from '../dao/betOptions';

import { mapBet } from '../mappers/bet';
import { mapComment } from '../mappers/comment';
import { mapOption } from '../mappers/option';

export const betRepository: BetRepository = {
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

  async getBetParticipants(id: string) {
    const rows = await getBetParticipantsByBetId(id);

    return rows
      .filter((row) => row && typeof row === 'object' && row.id)
      .map((row: any) => ({
        id: String(row.id),
        userId: String(row.user_id ?? ''),
        username: String(row.user?.username ?? 'Utilisateur inconnu'),
        optionId: row.option_id == null ? null : Number(row.option_id),
        optionValue: row.option?.value == null ? null : String(row.option.value),
        points: Number(row.points ?? 0),
        isCreator: Boolean(row.is_creator),
        updatedAt: row.updated_at ? new Date(row.updated_at) : null,
      }));
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

  async resolveBet(betId: string, winningValue: string) {
    await resolveBetDao(betId, winningValue);
  },

  async deleteBet(betId: string) {
    await deleteBetById(betId);
  },
};
