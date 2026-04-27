import { mapUserStatisticsDto } from '@/infrastructure/db/mappers/userStatistics';

describe('mapUserStatisticsDto', () => {
  it('map user statistics DTO to domain user statistics', () => {
    const dto = {
      total_bets: 12,
      win_rate: 0.75,
      ranking: 3,
    };

    const result = mapUserStatisticsDto(dto);

    expect(result).toStrictEqual({
      totalBets: 12,
      winRate: 0.75,
      ranking: 3,
    });
  });

  it('returns zero values when dto is null', () => {
    const result = mapUserStatisticsDto(null);

    expect(result).toStrictEqual({
      totalBets: 0,
      winRate: 0,
      ranking: 0,
    });
  });

  it('returns zero values when dto contains invalid values', () => {
    const dto = {
      total_bets: 'invalid',
      win_rate: undefined,
      ranking: NaN,
    };

    const result = mapUserStatisticsDto(dto);

    expect(result).toStrictEqual({
      totalBets: 0,
      winRate: 0,
      ranking: 0,
    });
  });
});
