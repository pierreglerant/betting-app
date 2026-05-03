import { getBetOptionsForBetUseCase } from '@/domain/usecases/getBetOptionsForBet';
import type { BetRepository } from '@/domain/repositories/BetRepository';
import type { Option } from '@/domain/entities/Option';

describe('getBetOptionsForBetUseCase', () => {
  const options: Option[] = [
    { id: '1', betId: 'bet-1', value: 'yes' },
    { id: '2', betId: 'bet-1', value: 'no' },
  ];

  function makeBetRepositoryMock() {
    return {
      getBetOptionsForBet: jest.fn(),
    } as unknown as jest.Mocked<BetRepository>;
  }

  it('calls repo.getBetOptionsForBet when input is valid', async () => {
    const repo = makeBetRepositoryMock();

    repo.getBetOptionsForBet.mockResolvedValue(options);

    const result = await getBetOptionsForBetUseCase(repo, ' bet-1 ');

    expect(repo.getBetOptionsForBet).toHaveBeenCalledTimes(1);
    expect(repo.getBetOptionsForBet).toHaveBeenCalledWith('bet-1');
    expect(result).toEqual(options);
  });

  it('throws when betId is empty', async () => {
    const repo = makeBetRepositoryMock();

    await expect(getBetOptionsForBetUseCase(repo, '')).rejects.toThrow('Bet id is required');

    expect(repo.getBetOptionsForBet).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    const repo = makeBetRepositoryMock();

    repo.getBetOptionsForBet.mockRejectedValue(new Error('Database error'));

    await expect(getBetOptionsForBetUseCase(repo, 'bet-1')).rejects.toThrow('Database error');

    expect(repo.getBetOptionsForBet).toHaveBeenCalledTimes(1);
  });
});
