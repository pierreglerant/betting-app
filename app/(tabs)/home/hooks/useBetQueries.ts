import { supabase } from '@/libs/supabase';
import { useCallback, useState } from 'react';
import { Bet, UserLite } from '../types';

export function useOpenBetsData(userId: string | undefined) {
  const [openBets, setOpenBets] = useState<Bet[]>([]);
  const [users, setUsers] = useState<UserLite[]>([]);
  const [excludedSet, setExcludedSet] = useState<Set<string>>(new Set());
  const [predictedSet, setPredictedSet] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    if (!userId) return;

    const [betsRes, usersRes, excludedRes, predictedRes] = await Promise.all([
      supabase
        .from('bets')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false }),
      supabase.from('users').select('id, username'),
      supabase.from('bet_tags').select('bet_id').eq('user_id', userId),
      supabase.from('predictions').select('bet_id').eq('user_id', userId),
    ]);

    if (betsRes.error) {
      console.error('Error fetching open bets:', betsRes.error);
      return;
    }
    if (usersRes.error) {
      console.error('Error fetching users:', usersRes.error);
      return;
    }
    if (excludedRes.error) {
      console.error('Error fetching excluded bets:', excludedRes.error);
    }
    if (predictedRes.error) {
      console.error('Error fetching predictions:', predictedRes.error);
    }

    setOpenBets(betsRes.data || []);
    setUsers(usersRes.data || []);
    setExcludedSet(new Set((excludedRes.data || []).map((e) => e.bet_id)));
    setPredictedSet(new Set((predictedRes.data || []).map((p) => p.bet_id)));
  }, [userId]);

  return { openBets, users, excludedSet, predictedSet, reload };
}

export function useMyLaunchedBetsData(userId: string | undefined) {
  const [bets, setBets] = useState<Bet[]>([]);

  const reload = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('creator_id', userId)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my launched bets:', error);
      return;
    }

    setBets(data || []);
  }, [userId]);

  return { bets, reload };
}

export function useFinishedBetsData() {
  const [bets, setBets] = useState<Bet[]>([]);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('status', 'resolved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching finished bets:', error);
      return;
    }

    setBets(data || []);
  }, []);

  return { bets, reload };
}

export function useUserStatisticsData(userId: string | undefined) {
  const [stats, setStats] = useState({
    totalBets: 0,
    winRate: 0,
    ranking: 0,
  });

  const reload = useCallback(async () => {
    if (!userId) {
      console.log('[useUserStatisticsData] Missing userId, skip fetch');
      return;
    }

    console.log('[useUserStatisticsData] Fetch start', { userId });

    const { data, error } = await supabase.rpc('get_user_statistics', { p_user_id: userId });

    console.log('[useUserStatisticsData] RPC response', { data, error });

    if (error) {
      console.error('Error fetching user statistics:', error);
      return;
    }

    const nextStats = {
      totalBets: data?.total_bets || 0,
      winRate: data?.win_rate || 0,
      ranking: data?.ranking || 0,
    };

    console.log('[useUserStatisticsData] Normalized stats', nextStats);
    setStats(nextStats);
  }, [userId]);

  return { stats, reload };
}
