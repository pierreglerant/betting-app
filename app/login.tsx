import { useState } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { supabase } from '@/libs/supabase';

export default function Login() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username) return;

    setLoading(true);

    // check si user existe
    let { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    // si erreur "not found", on crée
    if (error && error.code === 'PGRST116') {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ username })
        .select()
        .single();

      if (insertError) {
        console.log(insertError);
        setLoading(false);
        return;
      }

      data = newUser;
    }

    if (!data) {
      console.log('Erreur récupération user');
      setLoading(false);
      return;
    }

    // stocker en local
    await AsyncStorage.setItem('user', JSON.stringify(data));

    // redirection vers l'app
    router.replace('/');

    setLoading(false);
  };

  return (
    <View style={{ marginTop: 100, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Bets & Binouzes 🍻
      </Text>

      <TextInput
        placeholder="Ton pseudo"
        value={username}
        onChangeText={setUsername}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
        }}
      />

      <Pressable
        onPress={handleLogin}
        style={{
          marginTop: 20,
          backgroundColor: 'black',
          padding: 12,
          borderRadius: 8,
          opacity: loading ? 0.5 : 1,
        }}
        disabled={loading}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {loading ? 'Connexion...' : 'Entrer'}
        </Text>
      </Pressable>
    </View>
  );
}