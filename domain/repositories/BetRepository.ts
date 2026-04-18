import { Bet } from '../entities/Bet';
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
  createBet(bet: Bet, optionValues: string[], creatorId: string): Promise<string>;
  getBetOptionsForBet(betId: string): Promise<Option[]>;
  placeBet(userId: string, betId: string, optionId: number, points: number): Promise<string>;
  resolveBet(betId: string, winningValue: string): Promise<void>;
  deleteBet(betId: string): Promise<void>;
}
