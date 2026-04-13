import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { useAuth } from '@/contexts/auth-context';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import FinishedBetsSection from './sections/FinishedBetsSection';
import MyLaunchedBetsSection from './sections/MyLaunchedBetsSection';
import OpenBetsSection from './sections/OpenBetsSection';

export default function HomeScreen() {
  const { user, isLoading } = useAuth();
  const [refreshKey, setRefreshKey] = React.useState(0);

  const refreshAll = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <View style={{ marginTop: 100, alignItems: 'center' }}>
        <Text style={{ color: colors.textMuted, fontFamily: fonts.medium }}>Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 20, color: colors.text, fontFamily: fonts.bold }}>
        Bienvenue {user.username} 🍻
      </Text>

      <OpenBetsSection userId={user.id} refreshKey={refreshKey} onDataChanged={refreshAll} />

      <MyLaunchedBetsSection userId={user.id} refreshKey={refreshKey} onDataChanged={refreshAll} />

      <FinishedBetsSection refreshKey={refreshKey} />
    </ScrollView>
  );
}
