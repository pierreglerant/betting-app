const mockUpsert = jest.fn();
const mockFrom = jest.fn(() => ({ upsert: mockUpsert }));

jest.mock('@/infrastructure/db/api/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

describe('userDevice DAO', () => {
  let saveUserDevice: typeof import('@/infrastructure/db/dao/userDevice').saveUserDevice;

  beforeAll(() => {
    ({ saveUserDevice } = require('@/infrastructure/db/dao/userDevice'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveUserDevice', () => {
    it('upserts the user device with push token as conflict target', async () => {
      mockUpsert.mockResolvedValue({ error: null });

      await saveUserDevice('user-1', 'push-token-1', 'iPhone 15');

      expect(mockFrom).toHaveBeenCalledWith('user_device');
      expect(mockUpsert).toHaveBeenCalledTimes(1);

      const [payload, options] = mockUpsert.mock.calls[0];
      expect(payload).toMatchObject({
        user_id: 'user-1',
        push_token: 'push-token-1',
        device_name: 'iPhone 15',
      });
      expect(typeof payload.updated_at).toBe('string');
      expect(options).toEqual({ onConflict: 'push_token' });
    });

    it('throws when the upsert fails', async () => {
      mockUpsert.mockResolvedValue({
        error: new Error('upsert failed'),
      });

      await expect(saveUserDevice('user-1', 'push-token-1', 'iPhone 15')).rejects.toThrow(
        'upsert failed',
      );
    });
  });
});
