import { supabase } from '@/libs/supabase';
import { useCallback, useState } from 'react';

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

export function useUserPointsNumber(userId: string | undefined) {
  const [points, setPoints] = useState(0);

  const reload = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase.from('users').select('points').eq('id', userId).single();

    if (error) {
      console.error('Error fetching user points:', error);
      return;
    }

    setPoints(data?.points || 0);
  }, [userId]);

  return { points, reload };
}
