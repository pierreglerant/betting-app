import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/libs/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function Login() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        setErrorMessage('Pseudo introuvable');
        return;
      }

      await login(data);
      router.replace('/');
    } catch (e) {
      setErrorMessage('Erreur de connexion');
    } finally {
      setLoading(false);
    }
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