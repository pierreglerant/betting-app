import { getBetParticipantsUseCase } from '@/domain/usecases/getBetParticipants';
import type { BetParticipant } from '@/domain/entities/BetParticipant';
import type { BetRepository } from '@/domain/repositories/BetRepository';

describe('getBetParticipantsUseCase', () => {
  const participants: BetParticipant[] = [
    {
      id: '1',
      userId: 'user-1',
      username: 'pierre',
      optionId: 1,
      optionValue: 'yes',
      points: 10,
      isCreator: true,
      updatedAt: new Date('2026-04-27T10:00:00Z'),
    },
  ];

  function makeBetRepositoryMock() {
    return {
      getBetParticipants: jest.fn(),
    } as unknown as jest.Mocked<BetRepository>;
  }

  it('calls repo.getBetParticipants when betId is valid', async () => {
    const repo = makeBetRepositoryMock();

    repo.getBetParticipants.mockResolvedValue(participants);

    const result = await getBetParticipantsUseCase(repo, ' bet-1 ');

    expect(repo.getBetParticipants).toHaveBeenCalledTimes(1);
    expect(repo.getBetParticipants).toHaveBeenCalledWith('bet-1');
    expect(result).toEqual(participants);
  });

  it('returns an empty array when betId is empty', async () => {
    const repo = makeBetRepositoryMock();

    const result = await getBetParticipantsUseCase(repo, '');

    expect(result).toEqual([]);
    expect(repo.getBetParticipants).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    const repo = makeBetRepositoryMock();

    repo.getBetParticipants.mockRejectedValue(new Error('Database error'));

    await expect(getBetParticipantsUseCase(repo, 'bet-1')).rejects.toThrow('Database error');

    expect(repo.getBetParticipants).toHaveBeenCalledTimes(1);
  });
});
