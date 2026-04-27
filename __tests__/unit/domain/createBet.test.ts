import { createBetUseCase } from '@/domain/usecases/createBet';
import { Bet } from '@/domain/entities/Bet';
import { BetRepository } from '@/domain/repositories/BetRepository';

describe('createBetUseCase', () => {
  const bet = {
    id: 'bet-1',
    title: 'Ben boit plus de 2 pintes ?',
    context: 'Soirée vendredi',
    creatorId: 'user-1',
    status: 'open',
    result: null,
    createdAt: new Date('2026-04-27T10:00:00Z'),
    deadline: null,
  } as unknown as Bet;

  function makeBetRepositoryMock() {
    return {
      createBet: jest.fn(),
    } as unknown as jest.Mocked<BetRepository>;
  }

  it('calls repo.createBet when input is valid', async () => {
    const repo = makeBetRepositoryMock();
    const createdBetId = 'bet-1';

    repo.createBet.mockResolvedValue(createdBetId);

    const result = await createBetUseCase(repo, bet, ['yes', 'no'], ' user-1 ');

    expect(repo.createBet).toHaveBeenCalledTimes(1);
    expect(repo.createBet).toHaveBeenCalledWith(bet, ['yes', 'no'], 'user-1');
    expect(result).toBe(createdBetId);
  });

  it('throws when creatorId is empty', async () => {
    const repo = makeBetRepositoryMock();

    await expect(createBetUseCase(repo, bet, ['yes', 'no'], '')).rejects.toThrow(
      'Creator id is required',
    );

    expect(repo.createBet).not.toHaveBeenCalled();
  });

  it('throws when creatorId contains only spaces', async () => {
    const repo = makeBetRepositoryMock();

    await expect(createBetUseCase(repo, bet, ['yes', 'no'], '   ')).rejects.toThrow(
      'Creator id is required',
    );

    expect(repo.createBet).not.toHaveBeenCalled();
  });

  it('throws when there are less than 2 options', async () => {
    const repo = makeBetRepositoryMock();

    await expect(createBetUseCase(repo, bet, ['yes'], 'user-1')).rejects.toThrow(
      'At least 2 options required',
    );

    expect(repo.createBet).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    const repo = makeBetRepositoryMock();

    repo.createBet.mockRejectedValue(new Error('Database error'));

    await expect(createBetUseCase(repo, bet, ['yes', 'no'], 'user-1')).rejects.toThrow(
      'Database error',
    );

    expect(repo.createBet).toHaveBeenCalledTimes(1);
  });
});
