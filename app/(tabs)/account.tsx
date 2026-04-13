import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/libs/supabase';
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
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

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
      const confirmed = window.confirm('Es-tu sur ?');
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

    const trimmed = username.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from('users')
      .update({ username: trimmed })
      .eq('id', user.id);

    if (error) {
      console.error('[username update error]', error);
      return;
    }

    await setUser({ ...user, username: trimmed });
  };

  const pickAndUploadImage = async () => {
    if (!user) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled) return;

    const image = result.assets[0];

    if (!image.base64) {
      console.error('[avatar] no base64 found');
      return;
    }

    const mimeType = image.mimeType || 'image/jpeg';
    const extension =
      mimeType === 'image/png'
        ? 'png'
        : mimeType === 'image/webp'
        ? 'webp'
        : 'jpg';

    const filePath = `${user.id}.${extension}`;

    try {
      const fileBuffer = decode(image.base64);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileBuffer, {
          upsert: true,
          contentType: mimeType,
        });

      if (uploadError) {
        console.error('[avatar upload error]', uploadError);
        Alert.alert('Erreur upload');
        return;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('[avatar db error]', updateError);
        Alert.alert('Erreur DB');
        return;
      }

      await setUser({ ...user, avatar_url: avatarUrl });

    } catch (e) {
      console.error('[avatar crash]', e);
      Alert.alert('Erreur upload');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 40 }}>
      <Text style={{ fontSize: 28, textAlign: 'center', marginBottom: 30 }}>
        Mon Compte
      </Text>

      {user && (
        <View style={{ flex: 1 }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
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

            <Pressable
              onPress={pickAndUploadImage}
              style={{
                marginTop: 10,
                padding: 10,
                backgroundColor: '#2563eb',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: 'white' }}>Changer la photo</Text>
            </Pressable>
          </View>

          <TextInput
            value={username}
            onChangeText={setUsername}
            style={{
              borderWidth: 1,
              padding: 10,
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

          <Pressable
            onPress={handleLogout}
            style={{
              backgroundColor: 'red',
              padding: 10,
              marginTop: 20,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white' }}>Logout</Text>
          </Pressable>
        </View>
      )}

      <Modal visible={modalVisible} transparent>
        <Pressable
          onPress={() => setModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {user?.avatar_url && (
            <Image
              source={{ uri: user.avatar_url }}
              style={{ width: '90%', height: '60%' }}
            />
          )}
        </Pressable>
      </Modal>
    </View>
  );
}