const mockEq = jest.fn();
const mockUpdate = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ update: mockUpdate }));

jest.mock('@/infrastructure/db/api/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

describe('profile DAO', () => {
  let updateAvatarUrl: typeof import('@/infrastructure/db/dao/profile').updateAvatarUrl;
  let updateUsername: typeof import('@/infrastructure/db/dao/profile').updateUsername;

  beforeAll(() => {
    ({ updateAvatarUrl, updateUsername } = require('@/infrastructure/db/dao/profile'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUsername', () => {
    it('updates the username for the target user', async () => {
      mockEq.mockResolvedValue({ error: null });

      await updateUsername('user-1', 'pierre');

      expect(mockFrom).toHaveBeenCalledWith('user');
      expect(mockUpdate).toHaveBeenCalledWith({ username: 'pierre' });
      expect(mockEq).toHaveBeenCalledWith('id', 'user-1');
    });

    it('throws when the username update fails', async () => {
      mockEq.mockResolvedValue({
        error: new Error('update username failed'),
      });

      await expect(updateUsername('user-1', 'pierre')).rejects.toThrow('update username failed');
    });
  });

  describe('updateAvatarUrl', () => {
    it('updates the avatar url for the target user', async () => {
      mockEq.mockResolvedValue({ error: null });

      await updateAvatarUrl('user-1', 'https://cdn.test/avatar.png');

      expect(mockFrom).toHaveBeenCalledWith('user');
      expect(mockUpdate).toHaveBeenCalledWith({ avatar_url: 'https://cdn.test/avatar.png' });
      expect(mockEq).toHaveBeenCalledWith('id', 'user-1');
    });

    it('throws when the avatar update fails', async () => {
      mockEq.mockResolvedValue({
        error: new Error('update avatar failed'),
      });

      await expect(updateAvatarUrl('user-1', 'https://cdn.test/avatar.png')).rejects.toThrow(
        'update avatar failed',
      );
    });
  });
});
