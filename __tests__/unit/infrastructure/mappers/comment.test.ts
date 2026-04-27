import { mapComment } from '@/infrastructure/db/mappers/comment';

describe('mapComment', () => {
  it('map comment DTO to domain comment', () => {
    const dto = {
      id: 'comment-1',
      user_bet_id: 'user-bet-1',
      content: 'Test comment',
      created_at: new Date('2026-04-27T10:00:00Z'),
    };

    const result = mapComment(dto);

    expect(result).toStrictEqual({
      id: 'comment-1',
      userBetId: 'user-bet-1',
      content: 'Test comment',
      createdAt: new Date('2026-04-27T10:00:00Z'),
    });
  });
});
