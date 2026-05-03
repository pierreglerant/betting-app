import { mapUser } from '@/infrastructure/db/mappers/user';

describe('mapUser', () => {
  it('map user DTO to domain user', () => {
    const dto = {
      id: 'user-1',
      username: 'pierre',
      avatar_url: 'https://example.com/avatar.png',
      created_at: new Date('2026-04-27T10:00:00Z'),
      points: 1000,
    };

    const result = mapUser(dto);

    expect(result).toStrictEqual({
      id: 'user-1',
      username: 'pierre',
      avatarUrl: 'https://example.com/avatar.png',
      createdAt: new Date('2026-04-27T10:00:00Z'),
      points: 1000,
    });
  });
});
