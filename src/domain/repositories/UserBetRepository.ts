export interface UserBetRepository {
  getPredictedBetIds(userId: string): Promise<string[]>;
}
