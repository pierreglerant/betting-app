const mockSecondEq = jest.fn();
const mockFirstEq = jest.fn(() => ({ eq: mockSecondEq }));
const mockSelect = jest.fn(() => ({ eq: mockFirstEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

jest.mock('@/infrastructure/db/api/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

describe('userBet DAO', () => {
  let getUserBetsByUserId: typeof import('@/infrastructure/db/dao/userBet').getUserBetsByUserId;

  beforeAll(() => {
    ({ getUserBetsByUserId } = require('@/infrastructure/db/dao/userBet'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserBetsByUserId', () => {
    it('returns the user bet ids for non creators', async () => {
      const rows = [{ bet_id: 'bet-1' }, { bet_id: 'bet-2' }];
      mockSecondEq.mockResolvedValue({
        data: rows,
        error: null,
      });

      const result = await getUserBetsByUserId('user-1');

      expect(mockFrom).toHaveBeenCalledWith('user_bet');
      expect(mockSelect).toHaveBeenCalledWith('bet_id');
      expect(mockFirstEq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockSecondEq).toHaveBeenCalledWith('is_creator', false);
      expect(result).toEqual(rows);
    });

    it('returns an empty array when no rows are returned', async () => {
      mockSecondEq.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(getUserBetsByUserId('user-1')).resolves.toEqual([]);
    });

    it('throws when the query fails', async () => {
      mockSecondEq.mockResolvedValue({
        data: null,
        error: new Error('user_bet query failed'),
      });

      await expect(getUserBetsByUserId('user-1')).rejects.toThrow('user_bet query failed');
    });
  });
});
