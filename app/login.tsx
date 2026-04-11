import { useState } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { supabase } from '@/libs/supabase';

export default function Login() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!username) return;

    setLoading(true);
    setErrorMessage('');

    // Fetch user from database by username
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    // If user does not exist → show error
    if (error || !data) {
      setErrorMessage('Pseudo introuvable');
      setLoading(false);
      return;
    }

    // Store user locally (acts as session)
    await AsyncStorage.setItem('user', JSON.stringify(data));

    // Redirect to home screen
    router.replace('/');

    setLoading(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 28, marginBottom: 30, textAlign: 'center' }}>
        🍻 Bets & Binouzes
      </Text>

      <TextInput
        placeholder="Ton pseudo"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 14,
          borderRadius: 10,
          backgroundColor: '#fff',
          fontSize: 16,
          color: 'black',
        }}
      />

      <Pressable
        onPress={handleLogin}
        style={{
          marginTop: 20,
          backgroundColor: '#111',
          padding: 14,
          borderRadius: 10,
          alignItems: 'center',
          opacity: loading ? 0.5 : 1,
        }}
        disabled={loading}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>
          {loading ? 'Connexion...' : 'Entrer'}
        </Text>
      </Pressable>

      {errorMessage ? (
        <Text style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}