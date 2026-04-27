import { getBetsUseCase } from '@/domain/usecases/getBets';
import type { Bet } from '@/domain/entities/Bet';
import type { BetRepository } from '@/domain/repositories/BetRepository';

describe('getBetsUseCase', () => {
  const bets: Bet[] = [
    {
      id: 'bet-1',
      title: 'Ben boit plus de 2 pintes ?',
      context: 'Soirée vendredi',
      endDate: null,
      isOpen: true,
      result: null,
      resultImageUrl: null,
      createdAt: new Date('2026-04-27T10:00:00Z'),
      creatorId: 'user-1',
    },
  ];

  function makeBetRepositoryMock() {
    return {
      getBets: jest.fn(),
    } as unknown as jest.Mocked<BetRepository>;
  }

  it('calls repo.getBets and returns bets', async () => {
    const repo = makeBetRepositoryMock();

    repo.getBets.mockResolvedValue(bets);

    const result = await getBetsUseCase(repo);

    expect(repo.getBets).toHaveBeenCalledTimes(1);
    expect(result).toEqual(bets);
  });

  it('propagates repository errors', async () => {
    const repo = makeBetRepositoryMock();

    repo.getBets.mockRejectedValue(new Error('Database error'));

    await expect(getBetsUseCase(repo)).rejects.toThrow('Database error');

    expect(repo.getBets).toHaveBeenCalledTimes(1);
  });
});
