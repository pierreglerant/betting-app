import { getBetWithDetailsUseCase } from '@/domain/usecases/getBetWithDetails';
import type { BetRepository } from '@/domain/repositories/BetRepository';
import type { Bet } from '@/domain/entities/Bet';
import type { Comment } from '@/domain/entities/Comment';
import type { Option } from '@/domain/entities/Option';

describe('getBetWithDetailsUseCase', () => {
  const betWithDetails: Bet & { comments: Comment[]; options: Option[] } = {
    id: 'bet-1',
    title: 'Ben boit plus de 2 pintes ?',
    context: 'Soirée vendredi',
    endDate: null,
    isOpen: true,
    result: null,
    resultImageUrl: null,
    createdAt: new Date('2026-04-27T10:00:00Z'),
    creatorId: 'user-1',
    comments: [
      {
        id: 'comment-1',
        userBetId: 'user-bet-1',
        content: 'Test comment',
        createdAt: new Date('2026-04-27T10:00:00Z'),
      },
    ],
    options: [
      { id: '1', betId: 'bet-1', value: 'yes' },
      { id: '2', betId: 'bet-1', value: 'no' },
    ],
  };

  function makeBetRepositoryMock() {
    return {
      getBetWithDetails: jest.fn(),
    } as unknown as jest.Mocked<BetRepository>;
  }

  it('calls repo.getBetWithDetails and returns the bet details', async () => {
    const repo = makeBetRepositoryMock();

    repo.getBetWithDetails.mockResolvedValue(betWithDetails);

    const result = await getBetWithDetailsUseCase(repo, 'bet-1');

    expect(repo.getBetWithDetails).toHaveBeenCalledTimes(1);
    expect(repo.getBetWithDetails).toHaveBeenCalledWith('bet-1');
    expect(result).toEqual(betWithDetails);
  });

  it('propagates repository errors', async () => {
    const repo = makeBetRepositoryMock();

    repo.getBetWithDetails.mockRejectedValue(new Error('Database error'));

    await expect(getBetWithDetailsUseCase(repo, 'bet-1')).rejects.toThrow('Database error');

    expect(repo.getBetWithDetails).toHaveBeenCalledTimes(1);
  });
});
