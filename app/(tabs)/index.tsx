import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');

        if (!storedUser) {
          router.replace('/login');
        } else {
          const user = JSON.parse(storedUser);
          setUsername(user.username);
        }
      } catch (e) {
        console.log(e);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <View style={{ marginTop: 100 }}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24 }}>
        Bienvenue {username} 🍻
      </Text>
    </View>
  );
}