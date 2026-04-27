import { getBetByIdUseCase } from '@/domain/usecases/getBetById';
import type { Bet } from '@/domain/entities/Bet';
import type { BetRepository } from '@/domain/repositories/BetRepository';

describe('getBetByIdUseCase', () => {
  const bet: Bet = {
    id: 'bet-1',
    title: 'Ben boit plus de 2 pintes ?',
    context: 'Soirée vendredi',
    endDate: null,
    isOpen: true,
    result: null,
    resultImageUrl: null,
    createdAt: new Date('2026-04-27T10:00:00Z'),
    creatorId: 'user-1',
  };

  function makeBetRepositoryMock() {
    return {
      getBetById: jest.fn(),
    } as unknown as jest.Mocked<BetRepository>;
  }

  it('calls repo.getBetById and returns the bet', async () => {
    const repo = makeBetRepositoryMock();

    repo.getBetById.mockResolvedValue(bet);

    const result = await getBetByIdUseCase(repo, 'bet-1');

    expect(repo.getBetById).toHaveBeenCalledTimes(1);
    expect(repo.getBetById).toHaveBeenCalledWith('bet-1');
    expect(result).toEqual(bet);
  });

  it('propagates repository errors', async () => {
    const repo = makeBetRepositoryMock();

    repo.getBetById.mockRejectedValue(new Error('Database error'));

    await expect(getBetByIdUseCase(repo, 'bet-1')).rejects.toThrow('Database error');

    expect(repo.getBetById).toHaveBeenCalledTimes(1);
  });
});
