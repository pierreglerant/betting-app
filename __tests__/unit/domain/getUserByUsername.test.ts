import { getUserByUsernameUseCase } from '@/domain/usecases/getUserByUsername';
import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';

describe('getUserByUsernameUseCase', () => {
  const user: User = {
    id: 'user-1',
    username: 'pierre',
    avatarUrl: null,
    points: 1000,
    createdAt: new Date('2026-04-27T10:00:00Z'),
  };

  function makeUserRepositoryMock() {
    return {
      getUserByUsername: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
  }

  it('calls repo.getUserByUsername and returns the user', async () => {
    const repo = makeUserRepositoryMock();

    repo.getUserByUsername.mockResolvedValue(user);

    const result = await getUserByUsernameUseCase(repo, 'pierre');

    expect(repo.getUserByUsername).toHaveBeenCalledTimes(1);
    expect(repo.getUserByUsername).toHaveBeenCalledWith('pierre');
    expect(result).toEqual(user);
  });

  it('propagates repository errors', async () => {
    const repo = makeUserRepositoryMock();

    repo.getUserByUsername.mockRejectedValue(new Error('Database error'));

    await expect(getUserByUsernameUseCase(repo, 'pierre')).rejects.toThrow('Database error');

    expect(repo.getUserByUsername).toHaveBeenCalledTimes(1);
  });
});
