import { placeBetUseCase } from '@/domain/usecases/placeBet';
import type { BetRepository } from '@/domain/repositories/BetRepository';

describe('placeBetUseCase', () => {
  function makeBetRepositoryMock() {
    return {
      placeBet: jest.fn(),
    } as unknown as jest.Mocked<BetRepository>;
  }

  it('calls repo.placeBet when input is valid', async () => {
    const repo = makeBetRepositoryMock();
    const createdUserBetId = 'user-bet-1';

    repo.placeBet.mockResolvedValue(createdUserBetId);

    const result = await placeBetUseCase(repo, ' user-1 ', ' bet-1 ', 1, 50);

    expect(repo.placeBet).toHaveBeenCalledTimes(1);
    expect(repo.placeBet).toHaveBeenCalledWith('user-1', 'bet-1', 1, 50);
    expect(result).toBe(createdUserBetId);
  });

  it('throws when userId is empty', async () => {
    const repo = makeBetRepositoryMock();

    await expect(placeBetUseCase(repo, '', 'bet-1', 1, 50)).rejects.toThrow('User id is required');

    expect(repo.placeBet).not.toHaveBeenCalled();
  });

  it('throws when betId is empty', async () => {
    const repo = makeBetRepositoryMock();

    await expect(placeBetUseCase(repo, 'user-1', '', 1, 50)).rejects.toThrow('Bet id is required');

    expect(repo.placeBet).not.toHaveBeenCalled();
  });

  it('throws when optionId is invalid', async () => {
    const repo = makeBetRepositoryMock();

    await expect(placeBetUseCase(repo, 'user-1', 'bet-1', Number.NaN, 50)).rejects.toThrow(
      'Invalid option',
    );

    expect(repo.placeBet).not.toHaveBeenCalled();
  });

  it('throws when points are not greater than zero', async () => {
    const repo = makeBetRepositoryMock();

    await expect(placeBetUseCase(repo, 'user-1', 'bet-1', 1, 0)).rejects.toThrow(
      'Points must be > 0',
    );

    expect(repo.placeBet).not.toHaveBeenCalled();
  });

  it('throws when points are too large', async () => {
    const repo = makeBetRepositoryMock();

    await expect(placeBetUseCase(repo, 'user-1', 'bet-1', 1, 32768)).rejects.toThrow(
      'Points too large',
    );

    expect(repo.placeBet).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    const repo = makeBetRepositoryMock();

    repo.placeBet.mockRejectedValue(new Error('Database error'));

    await expect(placeBetUseCase(repo, 'user-1', 'bet-1', 1, 50)).rejects.toThrow('Database error');

    expect(repo.placeBet).toHaveBeenCalledTimes(1);
  });
});
