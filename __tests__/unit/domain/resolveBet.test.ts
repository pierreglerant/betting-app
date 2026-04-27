import { resolveBetUseCase } from '@/domain/usecases/resolveBet';
import type { BetRepository } from '@/domain/repositories/BetRepository';

describe('resolveBetUseCase', () => {
  function makeBetRepositoryMock() {
    return {
      resolveBet: jest.fn(),
    } as unknown as jest.Mocked<BetRepository>;
  }

  it('calls repo.resolveBet when input is valid', async () => {
    const repo = makeBetRepositoryMock();

    repo.resolveBet.mockResolvedValue(undefined);

    const result = await resolveBetUseCase(repo, ' bet-1 ', ' yes ');

    expect(repo.resolveBet).toHaveBeenCalledTimes(1);
    expect(repo.resolveBet).toHaveBeenCalledWith('bet-1', 'yes');
    expect(result).toBeUndefined();
  });

  it('throws when betId is empty', async () => {
    const repo = makeBetRepositoryMock();

    await expect(resolveBetUseCase(repo, '', 'yes')).rejects.toThrow('Bet id is required');

    expect(repo.resolveBet).not.toHaveBeenCalled();
  });

  it('throws when winningValue is empty', async () => {
    const repo = makeBetRepositoryMock();

    await expect(resolveBetUseCase(repo, 'bet-1', '')).rejects.toThrow('Winning value is required');

    expect(repo.resolveBet).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    const repo = makeBetRepositoryMock();

    repo.resolveBet.mockRejectedValue(new Error('Database error'));

    await expect(resolveBetUseCase(repo, 'bet-1', 'yes')).rejects.toThrow('Database error');

    expect(repo.resolveBet).toHaveBeenCalledTimes(1);
  });
});
