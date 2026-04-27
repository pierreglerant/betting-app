import { deleteBetUseCase } from '@/domain/usecases/deleteBet';
import type { BetRepository } from '@/domain/repositories/BetRepository';

describe('deleteBetUseCase', () => {
  const deletedBetId = 'bet-1';
  const requesterId = 'user-1';

  function makeBetRepositoryMock() {
    return {
      deleteBet: jest.fn(),
    } as unknown as jest.Mocked<BetRepository>;
  }

  it('calls repo.deleteBet when input is valid', async () => {
    const repo = makeBetRepositoryMock();

    repo.deleteBet.mockResolvedValue(undefined);

    const result = await deleteBetUseCase(repo, deletedBetId, requesterId);

    expect(repo.deleteBet).toHaveBeenCalledTimes(1);
    expect(repo.deleteBet).toHaveBeenCalledWith(deletedBetId, requesterId);
    expect(result).toBeUndefined();
  });

  it('throws when betId is empty', async () => {
    const repo = makeBetRepositoryMock();

    await expect(deleteBetUseCase(repo, '', requesterId)).rejects.toThrow('Bet id is required');

    expect(repo.deleteBet).not.toHaveBeenCalled();
  });

  it('throws when requesterId is empty', async () => {
    const repo = makeBetRepositoryMock();

    await expect(deleteBetUseCase(repo, deletedBetId, '')).rejects.toThrow(
      'Requester id is required',
    );

    expect(repo.deleteBet).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    const repo = makeBetRepositoryMock();

    repo.deleteBet.mockRejectedValue(new Error('Database error'));

    await expect(deleteBetUseCase(repo, deletedBetId, requesterId)).rejects.toThrow(
      'Database error',
    );

    expect(repo.deleteBet).toHaveBeenCalledTimes(1);
  });
});
