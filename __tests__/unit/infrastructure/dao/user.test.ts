const mockRpc = jest.fn();
const mockSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

jest.mock('@/infrastructure/db/api/supabase', () => ({
  supabase: {
    rpc: mockRpc,
    from: mockFrom,
  },
}));

describe('user DAO', () => {
  let getRanking: typeof import('@/infrastructure/db/dao/user').getRanking;
  let getUserByUsername: typeof import('@/infrastructure/db/dao/user').getUserByUsername;
  let getUserPoints: typeof import('@/infrastructure/db/dao/user').getUserPoints;
  let getUsers: typeof import('@/infrastructure/db/dao/user').getUsers;
  let getUserStatistics: typeof import('@/infrastructure/db/dao/user').getUserStatistics;

  beforeAll(() => {
    ({
      getRanking,
      getUserByUsername,
      getUserPoints,
      getUsers,
      getUserStatistics,
    } = require('@/infrastructure/db/dao/user'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('returns the array returned by rpc', async () => {
      const rows = [{ id: 'user-1' }, { id: 'user-2' }];
      mockRpc.mockResolvedValue({ data: rows, error: null });

      await expect(getUsers()).resolves.toEqual(rows);
      expect(mockRpc).toHaveBeenCalledWith('get_users');
    });

    it('wraps a single row into an array', async () => {
      mockRpc.mockResolvedValue({ data: { id: 'user-1' }, error: null });

      await expect(getUsers()).resolves.toEqual([{ id: 'user-1' }]);
    });

    it('returns an empty array when rpc returns null', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      await expect(getUsers()).resolves.toEqual([]);
    });

    it('throws when rpc fails', async () => {
      mockRpc.mockResolvedValue({ data: null, error: new Error('get_users failed') });

      await expect(getUsers()).rejects.toThrow('get_users failed');
    });
  });

  describe('getUserStatistics', () => {
    it('returns the first row when rpc returns an array', async () => {
      const row = { total_bets: 4 };
      mockRpc.mockResolvedValue({ data: [row], error: null });

      await expect(getUserStatistics('user-1')).resolves.toEqual(row);
      expect(mockRpc).toHaveBeenCalledWith('get_user_statistics', { p_user_id: 'user-1' });
    });

    it('returns the row when rpc returns an object', async () => {
      const row = { total_bets: 4 };
      mockRpc.mockResolvedValue({ data: row, error: null });

      await expect(getUserStatistics('user-1')).resolves.toEqual(row);
    });

    it('returns null when rpc returns a primitive', async () => {
      mockRpc.mockResolvedValue({ data: 0, error: null });

      await expect(getUserStatistics('user-1')).resolves.toBeNull();
    });

    it('throws when rpc fails', async () => {
      mockRpc.mockResolvedValue({ data: null, error: new Error('stats failed') });

      await expect(getUserStatistics('user-1')).rejects.toThrow('stats failed');
    });
  });

  describe('getUserPoints', () => {
    it('returns numeric user points', async () => {
      mockSingle.mockResolvedValue({ data: { points: '42' }, error: null });

      await expect(getUserPoints('user-1')).resolves.toBe(42);
      expect(mockFrom).toHaveBeenCalledWith('user');
      expect(mockSelect).toHaveBeenCalledWith('points');
      expect(mockEq).toHaveBeenCalledWith('id', 'user-1');
    });

    it('returns 0 when points are missing', async () => {
      mockSingle.mockResolvedValue({ data: {}, error: null });

      await expect(getUserPoints('user-1')).resolves.toBe(0);
    });

    it('throws when the query fails', async () => {
      mockSingle.mockResolvedValue({ data: null, error: new Error('points failed') });

      await expect(getUserPoints('user-1')).rejects.toThrow('points failed');
    });
  });

  describe('getUserByUsername', () => {
    it('returns the first row when rpc returns an array', async () => {
      const row = { id: 'user-1', username: 'pierre' };
      mockRpc.mockResolvedValue({ data: [row], error: null });

      await expect(getUserByUsername('pierre')).resolves.toEqual(row);
      expect(mockRpc).toHaveBeenCalledWith('get_user', { p_username: 'pierre' });
    });

    it('returns the row when rpc returns an object', async () => {
      const row = { id: 'user-1', username: 'pierre' };
      mockRpc.mockResolvedValue({ data: row, error: null });

      await expect(getUserByUsername('pierre')).resolves.toEqual(row);
    });

    it('throws when rpc returns null', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      await expect(getUserByUsername('pierre')).rejects.toThrow('User not found');
    });

    it('throws when rpc returns an empty array', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });

      await expect(getUserByUsername('pierre')).rejects.toThrow('User not found');
    });

    it('throws when rpc fails', async () => {
      mockRpc.mockResolvedValue({ data: null, error: new Error('get_user failed') });

      await expect(getUserByUsername('pierre')).rejects.toThrow('get_user failed');
    });
  });

  describe('getRanking', () => {
    it('returns ranking rows from rpc', async () => {
      const ranking = [{ user_id: 'user-1', points: 100 }];
      mockRpc.mockResolvedValue({ data: ranking, error: null });

      await expect(getRanking()).resolves.toEqual(ranking);
      expect(mockRpc).toHaveBeenCalledWith('get_ranking');
    });

    it('returns an empty array when rpc returns null', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      await expect(getRanking()).resolves.toEqual([]);
    });

    it('throws when rpc fails', async () => {
      mockRpc.mockResolvedValue({ data: null, error: new Error('ranking failed') });

      await expect(getRanking()).rejects.toThrow('ranking failed');
    });
  });
});
