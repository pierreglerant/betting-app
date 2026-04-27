import { mapBet } from '@/infrastructure/db/mappers/bet';

describe('mapBet', () => {
  it('map bet DTO to domain bet', () => {
    const dto = {
      id: 'bet-1',
      title: 'Bet 1',
      context: 'Bet context',
      end_date: new Date('2026-04-27T10:00:00Z'),
      is_open: true,
      result: 'yes',
      result_image_url: undefined,
      created_at: new Date('2026-04-27T10:00:00Z'),
      creator_id: 'user-1',
    };

    const result = mapBet(dto);

    expect(result).toStrictEqual({
      id: 'bet-1',
      title: 'Bet 1',
      context: 'Bet context',
      endDate: new Date('2026-04-27T10:00:00Z'),
      isOpen: true,
      result: 'yes',
      resultImageUrl: undefined,
      createdAt: new Date('2026-04-27T10:00:00Z'),
      creatorId: 'user-1',
    });
  });
});
