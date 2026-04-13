import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { useAuth } from '@/contexts/auth-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useUserPointsNumber } from './hooks/useBetQueries';
import FinishedBetsSection from './sections/FinishedBetsSection';
import MyLaunchedBetsSection from './sections/MyLaunchedBetsSection';
import OpenBetsSection from './sections/OpenBetsSection';
import StatisticsSection from './sections/StatisticsSection';

export default function HomeScreen() {
  const { user, isLoading } = useAuth();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { points } = useUserPointsNumber(user?.id);
  const router = useRouter();

  const refreshAll = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          marginTop: 100,
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.textMuted, fontFamily: fonts.medium }}>Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 15,
          paddingTop: 40,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable
          onPress={() => router.push('/account')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
          })}
        >
          {user.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: 12,
              }}
            />
          ) : (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.cardSoft,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ fontFamily: fonts.medium }}>👤</Text>
            </View>
          )}
        </Pressable>

        <Text
          style={{
            fontSize: 24,
            color: colors.text,
            fontFamily: fonts.display,
          }}
        >
          {user.username}
        </Text>
        <View
          style={{
            marginLeft: 'auto',
            backgroundColor: colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 12,
          }}
        >
          <FontAwesome5
            name="coins"
            solid
            size={16}
            color={colors.text}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              color: colors.text,
              fontFamily: fonts.medium,
            }}
          >
            {points} pts
          </Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={{
          padding: 20,
        }}
      >
        <StatisticsSection userId={user.id} />
        <OpenBetsSection userId={user.id} refreshKey={refreshKey} onDataChanged={refreshAll} />

        <MyLaunchedBetsSection
          userId={user.id}
          refreshKey={refreshKey}
          onDataChanged={refreshAll}
        />

        <FinishedBetsSection refreshKey={refreshKey} />
      </ScrollView>
    </View>
  );
}
