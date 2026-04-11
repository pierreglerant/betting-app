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
      const storedUser = await AsyncStorage.getItem('user');

      if (!storedUser) {
        router.replace('/login');
        return;
      }

      const user = JSON.parse(storedUser);
      setUsername(user.username);

      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return <Text style={{ marginTop: 100 }}>Loading...</Text>;
  }

  return (
    <View style={{ marginTop: 100, padding: 20 }}>
      <Text style={{ fontSize: 24 }}>
        Bienvenue {username} 🍻
      </Text>

      <Text style={{ marginTop: 20 }}>
        Tu peux maintenant créer des paris 👇
      </Text>
    </View>
  );
}