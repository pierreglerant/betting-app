import { getUserPointsUseCase } from '@/domain/usecases/getUserPoints';
import type { UserRepository } from '@/domain/repositories/UserRepository';

describe('getUserPointsUseCase', () => {
  function makeUserRepositoryMock() {
    return {
      getUserPoints: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
  }

  it('calls repo.getUserPoints when input is valid', async () => {
    const repo = makeUserRepositoryMock();

    repo.getUserPoints.mockResolvedValue(1000);

    const result = await getUserPointsUseCase(repo, ' user-1 ');

    expect(repo.getUserPoints).toHaveBeenCalledTimes(1);
    expect(repo.getUserPoints).toHaveBeenCalledWith('user-1');
    expect(result).toBe(1000);
  });

  it('throws when userId is empty', async () => {
    const repo = makeUserRepositoryMock();

    await expect(getUserPointsUseCase(repo, '')).rejects.toThrow('User id is required');

    expect(repo.getUserPoints).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    const repo = makeUserRepositoryMock();

    repo.getUserPoints.mockRejectedValue(new Error('Database error'));

    await expect(getUserPointsUseCase(repo, 'user-1')).rejects.toThrow('Database error');

    expect(repo.getUserPoints).toHaveBeenCalledTimes(1);
  });
});
