import { Bet } from '../entities/Bet';
import { BetParticipant } from '../entities/BetParticipant';
import { Comment } from '../entities/Comment';
import { Option } from '../entities/Option';

export interface BetRepository {
  getBets(): Promise<Bet[]>;
  getBetById(id: string): Promise<Bet>;
  getBetWithDetails(id: string): Promise<
    Bet & {
      comments: Comment[];
      options: Option[];
    }
  >;
  getBetParticipants(id: string): Promise<BetParticipant[]>;
  createBet(bet: Bet, optionValues: string[], creatorId: string): Promise<string>;
  getBetOptionsForBet(betId: string): Promise<Option[]>;
  placeBet(userId: string, betId: string, optionId: number, points: number): Promise<string>;
  resolveBet(betId: string, winningValue: string): Promise<void>;
  deleteBet(betId: string, requesterId: string): Promise<void>;
}
