import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isSignedIn, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    console.log('[layout] guard:state', {
      isSignedIn,
      isLoading,
      segment0: segments[0],
    });

    if (isLoading) {
      console.log('[layout] guard:skip while loading');
      return;
    }

    const inAuthGroup = segments[0] === 'login';

    if (!isSignedIn && !inAuthGroup) {
      console.log('[layout] guard:redirect -> /login');
      router.replace('/login');
    } else if (isSignedIn && inAuthGroup) {
      console.log('[layout] guard:redirect -> /home');
      router.replace('/home');
    } else {
      console.log('[layout] guard:no redirect');
    }
  }, [isSignedIn, segments, isLoading, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
