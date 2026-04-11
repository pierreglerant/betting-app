import { useState } from 'react';
import { View, Text, Pressable, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';

export default function Account() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const performLogout = async () => {
    console.log('[account] performLogout:start');
    setLoading(true);
    try {
      await logout();
      console.log('[account] performLogout:logout resolved, redirecting to /login');
      router.replace('/login');
    } catch (error) {
      console.error('[account] performLogout:error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('[account] handleLogout:prompt opened');

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Es-tu sur de vouloir te deconnecter ?');
      console.log('[account] handleLogout:web confirm =', confirmed);
      if (confirmed) {
        await performLogout();
      }
      return;
    }

    Alert.alert('Déconnexion', 'Es-tu sûr de vouloir te déconnecter ?', [
      {
        text: 'Annuler',
        onPress: () => {
          console.log('[account] handleLogout:cancel pressed');
        },
        style: 'cancel',
      },
      {
        text: 'Déconnexion',
        onPress: async () => {
          console.log('[account] handleLogout:confirm pressed');
          await performLogout();
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 40, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' }}>
        Mon Compte
      </Text>

      {user ? (
        <View style={{ flex: 1 }}>
          <View
            style={{
              backgroundColor: '#f5f5f5',
              padding: 20,
              borderRadius: 12,
              marginBottom: 30,
            }}
          >
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Utilisateur connecté
            </Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111' }}>
              {user.username}
            </Text>
            {user.email && (
              <Text style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
                {user.email}
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleLogout}
            disabled={loading}
            style={{
              backgroundColor: '#dc2626',
              padding: 16,
              borderRadius: 10,
              alignItems: 'center',
              marginTop: 'auto',
              marginBottom: 20,
              opacity: loading ? 0.5 : 1,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              {loading ? 'Déconnexion...' : 'Se déconnecter'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#666' }}>Aucun utilisateur connecté</Text>
        </View>
      )}
    </View>
  );
}
