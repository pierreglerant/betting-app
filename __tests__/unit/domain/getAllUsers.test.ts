import { getAllUsersUseCase } from '@/domain/usecases/getAllUsers';
import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';

describe('getAllUsersUseCase', () => {
  const users: User[] = [
    {
      id: 'user-1',
      username: 'pierre',
      avatarUrl: null,
      points: 1000,
      createdAt: new Date('2026-04-27T10:00:00Z'),
    },
    {
      id: 'user-2',
      username: 'ben',
      avatarUrl: null,
      points: 850,
      createdAt: new Date('2026-04-27T10:00:00Z'),
    },
  ];

  function makeUserRepositoryMock() {
    return {
      getAllUsers: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
  }

  it('calls repo.getAllUsers and returns users', async () => {
    const repo = makeUserRepositoryMock();

    repo.getAllUsers.mockResolvedValue(users);

    const result = await getAllUsersUseCase(repo);

    expect(repo.getAllUsers).toHaveBeenCalledTimes(1);
    expect(result).toEqual(users);
  });

  it('propagates repository errors', async () => {
    const repo = makeUserRepositoryMock();

    repo.getAllUsers.mockRejectedValue(new Error('Database error'));

    await expect(getAllUsersUseCase(repo)).rejects.toThrow('Database error');

    expect(repo.getAllUsers).toHaveBeenCalledTimes(1);
  });
});
