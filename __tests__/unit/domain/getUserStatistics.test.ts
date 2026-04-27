import { getUserStatisticsUseCase } from '@/domain/usecases/getUserStatistics';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import type { UserStatistics } from '@/domain/entities/UserStatistics';

describe('getUserStatisticsUseCase', () => {
  const stats: UserStatistics = {
    totalBets: 10,
    winRate: 0.5,
    ranking: 2,
  };

  function makeUserRepositoryMock() {
    return {
      getUserStatistics: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
  }

  it('calls repo.getUserStatistics when input is valid', async () => {
    const repo = makeUserRepositoryMock();

    repo.getUserStatistics.mockResolvedValue(stats);

    const result = await getUserStatisticsUseCase(repo, ' user-1 ');

    expect(repo.getUserStatistics).toHaveBeenCalledTimes(1);
    expect(repo.getUserStatistics).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(stats);
  });

  it('throws when userId is empty', async () => {
    const repo = makeUserRepositoryMock();

    await expect(getUserStatisticsUseCase(repo, '')).rejects.toThrow('User id is required');

    expect(repo.getUserStatistics).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    const repo = makeUserRepositoryMock();

    repo.getUserStatistics.mockRejectedValue(new Error('Database error'));

    await expect(getUserStatisticsUseCase(repo, 'user-1')).rejects.toThrow('Database error');

    expect(repo.getUserStatistics).toHaveBeenCalledTimes(1);
  });
});
