import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/auth-context';

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
      console.log('[layout] guard:redirect -> /(tabs)');
      router.replace('/(tabs)');
    } else {
      console.log('[layout] guard:no redirect');
    }
  }, [isSignedIn, segments, isLoading, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}