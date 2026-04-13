import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const fakeRanking = [
  { id: 1, name: 'John Doe', points: 100 },
  { id: 2, name: 'Jane Smith', points: 95 },
  { id: 3, name: 'Bob Johnson', points: 90 },
  { id: 4, name: 'Alice Williams', points: 85 },
  { id: 5, name: 'Charlie Brown', points: 80 },
  { id: 6, name: 'David Wilson', points: 75 },
  { id: 7, name: 'Emily Davis', points: 70 },
  { id: 8, name: 'Frank Miller', points: 65 },
  { id: 9, name: 'Grace Lee', points: 60 },
  { id: 10, name: 'Henry Taylor', points: 55 },
];

export default function RankingScreen() {
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

      {fakeRanking.map((user, index) => {
        const isLast = index === fakeRanking.length - 1;

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

              <Text style={{ color: colors.text, fontFamily: fonts.semiBold }}>{user.name}</Text>
            </View>

            <Text style={{ color: colors.textMuted, fontFamily: fonts.medium }}>
              {user.points} pts
            </Text>
          </View>
        );
      })}
    </View>
  );
}
