import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function RootIndex() {
  const { isSignedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isSignedIn) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/login');
    }
  }, [isSignedIn, isLoading, router]);

  return <View style={{ flex: 1 }} />;
}
