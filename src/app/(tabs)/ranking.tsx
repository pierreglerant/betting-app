import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { useRanking } from '@/presentation/hooks/useRanking';

export default function RankingScreen() {
  const { ranking, loading, error } = useRanking();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Text style={{ color: colors.error, textAlign: 'center', fontFamily: fonts.semiBold }}>
          Erreur : {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 15,
          paddingTop: 40,
          marginHorizontal: -20,
          marginTop: -20,
          marginBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <MaterialCommunityIcons
          name="trophy-outline"
          size={40}
          color={colors.primary}
          style={{ marginRight: 12 }}
        />

        <Text
          style={{
            fontSize: 24,
            color: colors.text,
            fontFamily: fonts.display,
            textTransform: 'uppercase',
          }}
        >
          Classement
        </Text>
      </View>
      <ScrollView>
        {ranking.map((user, index) => {
          const isLast = index === ranking.length - 1;

          let rankColor = 'rgba(209, 213, 219, 0.6)';

          if (index === 0) rankColor = '#FFD700';
          else if (index === 1) rankColor = '#C0C0C0';
          else if (index === 2) rankColor = '#CD7F32';

          return (
            <View
              key={user.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 15,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: rankColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      color: rankColor,
                      fontFamily: fonts.bold,
                    }}
                  >
                    {index + 1}
                  </Text>
                </View>

                <Text style={{ color: colors.text, fontFamily: fonts.semiBold }}>
                  {user.username}
                </Text>
              </View>

              <Text style={{ color: colors.textMuted, fontFamily: fonts.medium }}>
                {user.points} pts
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
