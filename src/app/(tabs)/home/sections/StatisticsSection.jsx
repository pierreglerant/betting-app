import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SectionHeader from '../components/SectionHeader';
import { useUserStatistics } from '@/presentation/hooks/useUserStatistics';

export default function StatisticsSection({ userId, refreshKey = 0 }) {
  const cardStyle = {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  };

  const { stats, reload } = useUserStatistics(userId);

  React.useEffect(() => {
    void reload();
  }, [reload, refreshKey]);

  return (
    <View>
      <SectionHeader title="Statistiques" />

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 8, marginBottom: 40 }}>
        {/* Card 1 */}
        <View style={cardStyle}>
          <MaterialCommunityIcons
            name="trophy"
            size={20}
            color={colors.primary}
            style={{ marginBottom: 6 }}
          />

          <Text
            style={{
              color: colors.textMuted,
              fontFamily: fonts.medium,
              textAlign: 'center',
            }}
          >
            Classement
          </Text>

          <Text
            style={{
              color: colors.text,
              fontFamily: fonts.bold,
              fontSize: 18,
              marginTop: 4,
            }}
          >
            {stats.ranking}
          </Text>
        </View>

        {/* Card 2 */}
        <View style={cardStyle}>
          <MaterialCommunityIcons
            name="ticket"
            size={20}
            color={colors.primary}
            style={{ marginBottom: 6 }}
          />

          <Text
            style={{
              color: colors.textMuted,
              fontFamily: fonts.medium,
              textAlign: 'center',
            }}
          >
            Paris joués
          </Text>

          <Text
            style={{
              color: colors.text,
              fontFamily: fonts.bold,
              fontSize: 18,
              marginTop: 4,
            }}
          >
            {stats.totalBets}
          </Text>
        </View>

        {/* Card 3 */}
        <View style={cardStyle}>
          <MaterialCommunityIcons
            name="chart-line"
            size={20}
            color={colors.primary}
            style={{ marginBottom: 6 }}
          />

          <Text
            style={{
              color: colors.textMuted,
              fontFamily: fonts.medium,
              textAlign: 'center',
            }}
          >
            Winrate
          </Text>

          <Text
            style={{
              color: colors.text,
              fontFamily: fonts.bold,
              fontSize: 18,
              marginTop: 4,
            }}
          >
            {stats.winRate}%
          </Text>
        </View>
      </View>
    </View>
  );
}
