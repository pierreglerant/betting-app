import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { useRegisterPushNotifications } from '@/presentation/hooks/useRegisterPushNotifications';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';

void SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn('[splash] preventAutoHideAsync failed', error);
});

function RootLayoutNav() {
  const { isSignedIn, isLoading, user } = useAuth();
  const registeredNotificationsForUserRef = useRef<string | null>(null);
  const { registerPushNotifications } = useRegisterPushNotifications();
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

  useEffect(() => {
    if (isLoading || !isSignedIn || !user?.id) {
      return;
    }

    if (registeredNotificationsForUserRef.current === user.id) {
      return;
    }

    registeredNotificationsForUserRef.current = user.id;

    void registerPushNotifications(user.id).then((result) => {
      console.log('[notifications] registration result', result.status);
    });
  }, [isLoading, isSignedIn, registerPushNotifications, user?.id]);

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

    void SplashScreen.hideAsync().catch((error) => {
      console.warn('[splash] hideAsync failed', error);
    });
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
