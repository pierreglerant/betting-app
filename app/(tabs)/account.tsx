import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  Text,
  View,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/libs/supabase';

export default function Account() {
  const { user, logout, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const performLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('[logout:error]', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Es-tu sur de vouloir te deconnecter ?');
      if (confirmed) await performLogout();
      return;
    }

    Alert.alert('Déconnexion', 'Es-tu sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', onPress: performLogout, style: 'destructive' },
    ]);
  };

  const updateUsername = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({ username })
      .eq('id', user.id);

    if (error) return console.error(error);

    await setUser({ ...user, username });
  };

  const pickAndUploadImage = async () => {
    if (!user) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const image = result.assets[0];
    const response = await fetch(image.uri);
    const blob = await response.blob();

    const filePath = `${user.id}.png`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        upsert: true,
        contentType: image.mimeType || 'image/jpeg',
      });

    if (error) return console.error(error);

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatarUrl = data.publicUrl;

    await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id);

    await setUser({ ...user, avatar_url: avatarUrl });
  };

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 40, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' }}>
        Mon Compte
      </Text>

      {user && (
        <View style={{ flex: 1 }}>
          
          {/* Avatar */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            
            {/* IMAGE → fullscreen */}
            <Pressable onPress={() => setModalVisible(true)}>
              {user.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
              ) : (
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: '#ddd',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text>👤</Text>
                </View>
              )}
            </Pressable>

            {/* BOUTON CHANGE */}
            <Pressable
              onPress={pickAndUploadImage}
              style={{
                marginTop: 10,
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: '#2563eb',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: 'white' }}>Changer la photo</Text>
            </Pressable>
          </View>

          {/* USERNAME */}
          <View
            style={{
              backgroundColor: '#f5f5f5',
              padding: 20,
              borderRadius: 12,
              marginBottom: 30,
            }}
          >
            <Text style={{ marginBottom: 8 }}>Username</Text>

            <TextInput
              value={username}
              onChangeText={setUsername}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
              }}
            />

            <Pressable
              onPress={updateUsername}
              style={{
                backgroundColor: '#2563eb',
                padding: 10,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white' }}>Enregistrer</Text>
            </Pressable>
          </View>

          {/* LOGOUT */}
          <Pressable
            onPress={handleLogout}
            style={{
              backgroundColor: '#dc2626',
              padding: 16,
              borderRadius: 10,
              alignItems: 'center',
              marginTop: 'auto',
            }}
          >
            <Text style={{ color: 'white' }}>Se déconnecter</Text>
          </Pressable>
        </View>
      )}

      {/* MODAL FULLSCREEN IMAGE */}
      <Modal visible={modalVisible} transparent={true}>
        <Pressable
          onPress={() => setModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {user?.avatar_url && (
            <Image
              source={{ uri: user.avatar_url }}
              style={{ width: '90%', height: '60%', resizeMode: 'contain' }}
            />
          )}
        </Pressable>
      </Modal>
    </View>
  );
}