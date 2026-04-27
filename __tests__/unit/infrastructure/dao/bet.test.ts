import type { Bet } from '@/domain/entities/Bet';

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

describe('bet DAO', () => {
  const fetchMock = jest.fn();
  let createBet: typeof import('@/infrastructure/db/dao/bet').createBet;
  let deleteBetById: typeof import('@/infrastructure/db/dao/bet').deleteBetById;
  let getBetById: typeof import('@/infrastructure/db/dao/bet').getBetById;
  let getBetCommentsByBetId: typeof import('@/infrastructure/db/dao/bet').getBetCommentsByBetId;
  let getBetOptionsByBetId: typeof import('@/infrastructure/db/dao/bet').getBetOptionsByBetId;
  let getBetParticipantsByBetId: typeof import('@/infrastructure/db/dao/bet').getBetParticipantsByBetId;
  let getBets: typeof import('@/infrastructure/db/dao/bet').getBets;
  let placeBet: typeof import('@/infrastructure/db/dao/bet').placeBet;
  let resolveBet: typeof import('@/infrastructure/db/dao/bet').resolveBet;

  beforeAll(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_KEY = 'test-key';
    global.fetch = fetchMock as unknown as typeof fetch;

    ({
      createBet,
      deleteBetById,
      getBetById,
      getBetCommentsByBetId,
      getBetOptionsByBetId,
      getBetParticipantsByBetId,
      getBets,
      placeBet,
      resolveBet,
    } = require('@/infrastructure/db/dao/bet'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockOrder.mockResolvedValue({ data: [], error: null });
    fetchMock.mockReset();
  });

  describe('getBets', () => {
    it('returns bets when rpc succeeds', async () => {
      const mockData = [
        { id: '1', title: 'Bet 1' },
        { id: '2', title: 'Bet 2' },
      ];

      mockRpc.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getBets();

      expect(mockRpc).toHaveBeenCalledWith('get_bets');
      expect(result).toEqual(mockData);
    });

    it('returns an empty array when data is null', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getBets();

      expect(result).toEqual([]);
    });

    it('throws when rpc fails', async () => {
      const mockError = new Error('RPC failed');

      mockRpc.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(getBets()).rejects.toThrow('RPC failed');
    });

    it('calls rpc only once', async () => {
      mockRpc.mockResolvedValue({
        data: [],
        error: null,
      });

      await getBets();

      expect(mockRpc).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBetById', () => {
    it('returns the bet when rpc succeeds', async () => {
      const mockBet = { id: 'bet-1', title: 'Bet 1' };

      mockRpc.mockResolvedValue({
        data: mockBet,
        error: null,
      });

      const result = await getBetById('bet-1');

      expect(mockRpc).toHaveBeenCalledWith('get_bet', { id: 'bet-1' });
      expect(result).toEqual(mockBet);
    });

    it('throws when rpc returns an error', async () => {
      const mockError = new Error('get_bet failed');

      mockRpc.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(getBetById('bet-1')).rejects.toThrow('get_bet failed');
    });

    it('throws when the bet is missing', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(getBetById('bet-1')).rejects.toThrow('Bet not found');
    });
  });

  describe('getBetCommentsByBetId', () => {
    it('returns comments when rpc succeeds', async () => {
      const mockComments = [{ id: 1, comment: 'first' }];

      mockRpc.mockResolvedValue({
        data: mockComments,
        error: null,
      });

      const result = await getBetCommentsByBetId('bet-1');

      expect(mockRpc).toHaveBeenCalledWith('get_bet_comments', { p_bet_id: 'bet-1' });
      expect(result).toEqual(mockComments);
    });

    it('returns an empty array when data is null', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(getBetCommentsByBetId('bet-1')).resolves.toEqual([]);
    });

    it('throws when rpc fails', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: new Error('comments failed'),
      });

      await expect(getBetCommentsByBetId('bet-1')).rejects.toThrow('comments failed');
    });
  });

  describe('getBetOptionsByBetId', () => {
    it('returns options when rpc succeeds', async () => {
      const mockOptions = [{ id: 1, value: 'PSG' }];

      mockRpc.mockResolvedValue({
        data: mockOptions,
        error: null,
      });

      const result = await getBetOptionsByBetId('bet-1');

      expect(mockRpc).toHaveBeenCalledWith('get_bet_options', { bet_id: 'bet-1' });
      expect(result).toEqual(mockOptions);
    });

    it('returns an empty array when data is null', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(getBetOptionsByBetId('bet-1')).resolves.toEqual([]);
    });

    it('throws when rpc fails', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: new Error('options failed'),
      });

      await expect(getBetOptionsByBetId('bet-1')).rejects.toThrow('options failed');
    });
  });

  describe('getBetParticipantsByBetId', () => {
    it('queries participants with the expected relation chain', async () => {
      const mockParticipants = [{ id: 'ub-1', user_id: 'user-1' }];
      mockOrder.mockResolvedValue({
        data: mockParticipants,
        error: null,
      });

      const result = await getBetParticipantsByBetId('bet-1');

      expect(mockFrom).toHaveBeenCalledWith('user_bet');
      expect(mockSelect).toHaveBeenCalledWith(
        `
        id,
        user_id,
        bet_id,
        points,
        updated_at,
        is_creator,
        option_id,
        user:user_id ( id, username ),
        option:option_id ( id, value )
      `,
      );
      expect(mockEq).toHaveBeenCalledWith('bet_id', 'bet-1');
      expect(mockOrder).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(result).toEqual(mockParticipants);
    });

    it('returns an empty array when data is null', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(getBetParticipantsByBetId('bet-1')).resolves.toEqual([]);
    });

    it('throws when the query fails', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: new Error('participants failed'),
      });

      await expect(getBetParticipantsByBetId('bet-1')).rejects.toThrow('participants failed');
    });
  });

  describe('placeBet', () => {
    it('returns the placement id when rpc succeeds', async () => {
      mockRpc.mockResolvedValue({
        data: 'user-bet-1',
        error: null,
      });

      const result = await placeBet('user-1', 'bet-1', 2, 150);

      expect(mockRpc).toHaveBeenCalledWith('place_bet', {
        p_user_id: 'user-1',
        p_bet_id: 'bet-1',
        p_option_id: 2,
        p_points: 150,
      });
      expect(result).toBe('user-bet-1');
    });

    it('throws when rpc fails', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: new Error('place_bet failed'),
      });

      await expect(placeBet('user-1', 'bet-1', 2, 150)).rejects.toThrow('place_bet failed');
    });

    it('throws when rpc returns null data', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(placeBet('user-1', 'bet-1', 2, 150)).rejects.toThrow('place_bet failed');
    });
  });

  describe('createBet', () => {
    const mockBet: Bet = {
      id: 'bet-1',
      title: 'Finale',
      context: 'PSG vs OM',
      endDate: new Date('2026-05-01T10:00:00.000Z'),
      isOpen: true,
      result: null,
      resultImageUrl: null,
      createdAt: new Date('2026-04-01T10:00:00.000Z'),
      creatorId: 'creator-1',
    };

    it('calls the edge function and returns the bet id', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify({ betId: 'bet-123' })),
      });

      const result = await createBet(mockBet, ['PSG', 'OM'], 'creator-1');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://test-project.supabase.co/functions/v1/bet-notifications',
        {
          method: 'POST',
          headers: {
            apikey: 'test-key',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'createBet',
            title: 'Finale',
            context: 'PSG vs OM',
            endDate: '2026-05-01T10:00:00.000Z',
            optionValues: ['PSG', 'OM'],
            creatorId: 'creator-1',
          }),
        },
      );
      expect(result).toBe('bet-123');
    });

    it('sends a null endDate when the bet has no end date', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify({ betId: 'bet-123' })),
      });

      await createBet({ ...mockBet, endDate: null }, ['PSG', 'OM'], 'creator-1');

      const [, request] = fetchMock.mock.calls[0];
      expect(request.body).toContain('"endDate":null');
    });

    it('throws when the edge function returns no betId', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify({ ok: true })),
      });

      await expect(createBet(mockBet, ['PSG', 'OM'], 'creator-1')).rejects.toThrow(
        'Failed to create bet',
      );
    });

    it('throws the edge function error message on failure', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue(JSON.stringify({ error: 'edge failed' })),
      });

      await expect(createBet(mockBet, ['PSG', 'OM'], 'creator-1')).rejects.toThrow('edge failed');
    });
  });

  describe('resolveBet', () => {
    it('calls the edge function with the winning value', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify({ ok: true })),
      });

      await resolveBet('bet-1', 'PSG');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://test-project.supabase.co/functions/v1/bet-notifications',
        {
          method: 'POST',
          headers: {
            apikey: 'test-key',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'resolveBet',
            betId: 'bet-1',
            winningValue: 'PSG',
          }),
        },
      );
    });

    it('throws the status fallback when the edge error body is empty', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 502,
        text: jest.fn().mockResolvedValue(''),
      });

      await expect(resolveBet('bet-1', 'PSG')).rejects.toThrow(
        'bet-notifications failed with status 502',
      );
    });
  });

  describe('deleteBetById', () => {
    it('calls the delete rpc with the requester id', async () => {
      mockRpc.mockResolvedValue({
        error: null,
      });

      await deleteBetById('bet-1', 'user-1');

      expect(mockRpc).toHaveBeenCalledWith('delete_bet', {
        p_bet_id: 'bet-1',
        p_requester_id: 'user-1',
      });
    });

    it('throws when delete rpc fails', async () => {
      mockRpc.mockResolvedValue({
        error: new Error('delete failed'),
      });

      await expect(deleteBetById('bet-1', 'user-1')).rejects.toThrow('delete failed');
    });
  });
});
