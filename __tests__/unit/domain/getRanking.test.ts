import { getRankingUseCase } from '@/domain/usecases/getRanking';
import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';

describe('getRankingUseCase', () => {
  const ranking: User[] = [
    {
      id: 'user-1',
      username: 'pierre',
      avatarUrl: null,
      points: 1000,
      createdAt: new Date('2026-04-27T10:00:00Z'),
    },
  ];

  function makeUserRepositoryMock() {
    return {
      getRanking: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
  }

  it('calls repo.getRanking and returns ranking', async () => {
    const repo = makeUserRepositoryMock();

    repo.getRanking.mockResolvedValue(ranking);

    const result = await getRankingUseCase(repo);

    expect(repo.getRanking).toHaveBeenCalledTimes(1);
    expect(result).toEqual(ranking);
  });

  it('propagates repository errors', async () => {
    const repo = makeUserRepositoryMock();

    repo.getRanking.mockRejectedValue(new Error('Database error'));

    await expect(getRankingUseCase(repo)).rejects.toThrow('Database error');

    expect(repo.getRanking).toHaveBeenCalledTimes(1);
  });
});
