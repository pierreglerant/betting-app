import { getUserPredictedBetsUseCase } from '@/domain/usecases/getUserPredictedBets';
import type { UserBetRepository } from '@/domain/repositories/UserBetRepository';

describe('getUserPredictedBetsUseCase', () => {
  function makeUserBetRepositoryMock() {
    return {
      getPredictedBetIds: jest.fn(),
    } as unknown as jest.Mocked<UserBetRepository>;
  }

  it('calls repo.getPredictedBetIds when userId is valid', async () => {
    const repo = makeUserBetRepositoryMock();

    repo.getPredictedBetIds.mockResolvedValue(['bet-1', 'bet-2']);

    const result = await getUserPredictedBetsUseCase(repo, ' user-1 ');

    expect(repo.getPredictedBetIds).toHaveBeenCalledTimes(1);
    expect(repo.getPredictedBetIds).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(['bet-1', 'bet-2']);
  });

  it('returns an empty array when userId is empty', async () => {
    const repo = makeUserBetRepositoryMock();

    const result = await getUserPredictedBetsUseCase(repo, '');

    expect(result).toEqual([]);
    expect(repo.getPredictedBetIds).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    const repo = makeUserBetRepositoryMock();

    repo.getPredictedBetIds.mockRejectedValue(new Error('Database error'));

    await expect(getUserPredictedBetsUseCase(repo, 'user-1')).rejects.toThrow('Database error');

    expect(repo.getPredictedBetIds).toHaveBeenCalledTimes(1);
  });
});
