import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { useAuth } from '@/contexts/auth-context';
import React from 'react';
import { Pressable, Image, ScrollView, Text, View } from 'react-native';
import FinishedBetsSection from './sections/FinishedBetsSection';
import MyLaunchedBetsSection from './sections/MyLaunchedBetsSection';
import OpenBetsSection from './sections/OpenBetsSection';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user, isLoading } = useAuth();
  const [refreshKey, setRefreshKey] = React.useState(0);
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
      {/* HEADER FIXE */}
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
          Bienvenue {user.username} 🍻
        </Text>
      </View>

      {/* CONTENU SCROLLABLE */}
      <ScrollView
        contentContainerStyle={{
          padding: 20,
        }}
      >
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
