const mockRpc = jest.fn();
const mockOrder = jest.fn();
const mockEq = jest.fn(() => ({ order: mockOrder }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

jest.mock('@/infrastructure/db/api/supabase', () => ({
  supabase: {
    rpc: mockRpc,
    from: mockFrom,
  },
}));

describe('betOptions DAO', () => {
  let getBetOptionsWithFallback: typeof import('@/infrastructure/db/dao/betOptions').getBetOptionsWithFallback;

  beforeAll(() => {
    ({ getBetOptionsWithFallback } = require('@/infrastructure/db/dao/betOptions'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBetOptionsWithFallback', () => {
    it('returns normalized rpc rows when rpc succeeds', async () => {
      mockRpc.mockResolvedValue({
        data: [
          { id: '1', value: 'PSG' },
          { Id: 2, Value: 'OM' },
        ],
        error: null,
      });

      await expect(getBetOptionsWithFallback('bet-1')).resolves.toEqual({
        options: [
          { id: 1, value: 'PSG' },
          { id: 2, value: 'OM' },
        ],
        error: null,
      });
      expect(mockRpc).toHaveBeenCalledWith('get_bet_options', { bet_id: 'bet-1' });
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('falls back to the option table when rpc returns no usable rows', async () => {
      mockRpc.mockResolvedValue({
        data: [],
        error: null,
      });
      mockOrder.mockResolvedValue({
        data: [
          { id: 3, value: 'Draw' },
          { id: '4', value: 'Marseille' },
        ],
        error: null,
      });

      await expect(getBetOptionsWithFallback('bet-1')).resolves.toEqual({
        options: [
          { id: 3, value: 'Draw' },
          { id: 4, value: 'Marseille' },
        ],
        error: null,
      });
      expect(mockFrom).toHaveBeenCalledWith('option');
      expect(mockSelect).toHaveBeenCalledWith('id, value');
      expect(mockEq).toHaveBeenCalledWith('bet_id', 'bet-1');
      expect(mockOrder).toHaveBeenCalledWith('id', { ascending: true });
    });

    it('returns a combined error when rpc and table fallback both fail', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: new Error('rpc failed'),
      });
      mockOrder.mockResolvedValue({
        data: null,
        error: new Error('table failed'),
      });

      await expect(getBetOptionsWithFallback('bet-1')).resolves.toEqual({
        options: [],
        error: 'rpc failed · table failed',
      });
    });

    it('returns the rpc error when the fallback table has no rows and no error', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: new Error('rpc failed'),
      });
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });

      await expect(getBetOptionsWithFallback('bet-1')).resolves.toEqual({
        options: [],
        error: 'rpc failed',
      });
    });

    it('returns the default hint when neither source yields data nor explicit errors', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: null,
      });
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getBetOptionsWithFallback('bet-1');

      expect(result.options).toEqual([]);
      expect(result.error).toContain('0 ligne renvoyée');
      expect(result.error).toContain('public.option');
    });

    it('filters out invalid rows during normalization', async () => {
      mockRpc.mockResolvedValue({
        data: [
          { id: 'abc', value: 'PSG' },
          { id: 1, value: '   ' },
          { id: 2, value: 'Valid' },
        ],
        error: null,
      });

      await expect(getBetOptionsWithFallback('bet-1')).resolves.toEqual({
        options: [{ id: 2, value: 'Valid' }],
        error: null,
      });
    });
  });
});
