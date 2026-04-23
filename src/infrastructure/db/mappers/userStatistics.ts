import type { UserStatistics } from '@/domain/entities/UserStatistics';

export function mapUserStatisticsDto(
  row: Record<string, unknown> | null | undefined,
): UserStatistics {
  if (row == null || typeof row !== 'object') {
    return { totalBets: 0, winRate: 0, ranking: 0 };
  }

  return {
    totalBets: Number(row.total_bets ?? 0) || 0,
    winRate: Number(row.win_rate ?? 0) || 0,
    ranking: Number(row.ranking ?? 0) || 0,
  };
}
