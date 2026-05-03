import logo from '../../assets/images/logo.png';
import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { useAuth } from '@/contexts/auth-context';
import { useLogin } from '@/presentation/hooks/useLogin';
import { useRegisterPushNotifications } from '@/presentation/hooks/useRegisterPushNotifications';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

export default function Login() {
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const { loginByUsername, loading } = useLogin();
  const { registerPushNotifications } = useRegisterPushNotifications();

  const handleLogin = async () => {
    if (!username) return;

    setErrorMessage('');

    try {
      const user = await loginByUsername(username);

      await login({
        id: user.id,
        username: user.username,
        avatar_url: user.avatarUrl ?? undefined,
      });
      await registerPushNotifications(user.id);

      router.replace('/home');
    } catch (err) {
      const isNotFound = err instanceof Error && err.message === 'User not found';
      setErrorMessage(isNotFound ? 'Pseudo introuvable' : 'Erreur de connexion');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 80,
        backgroundColor: colors.background,
      }}
    >
      <Image
        source={logo}
        style={{ width: 120, height: 120, alignSelf: 'center', marginBottom: -10 }}
      />
      <Text
        style={{
          fontSize: 28,
          marginBottom: 30,
          textAlign: 'center',
          color: colors.text,
          fontFamily: fonts.display,
        }}
      >
        Bets & Binouzes
      </Text>

      <TextInput
        placeholder="Ton pseudo"
        placeholderTextColor={colors.textMuted}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          padding: 14,
          borderRadius: 10,
          backgroundColor: colors.card,
          fontSize: 16,
          color: colors.text,
          fontFamily: fonts.regular,
        }}
      />

      <Pressable
        onPress={handleLogin}
        style={{
          marginTop: 20,
          backgroundColor: colors.primary,
          padding: 14,
          borderRadius: 10,
          alignItems: 'center',
          opacity: loading ? 0.5 : 1,
        }}
        disabled={loading}
      >
        <Text style={{ color: colors.text, fontSize: 16, fontFamily: fonts.semiBold }}>
          {loading ? 'Connexion...' : 'Entrer'}
        </Text>
      </Pressable>

      {errorMessage ? (
        <Text
          style={{
            color: colors.danger,
            marginTop: 10,
            textAlign: 'center',
            fontFamily: fonts.medium,
          }}
        >
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}
