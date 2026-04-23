import { colors } from '@/constants/theme';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="open-bets-all" />
      <Stack.Screen name="my-launched-all" />
      <Stack.Screen name="finished-all" />
    </Stack>
  );
}
