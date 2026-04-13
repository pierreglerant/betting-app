import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/libs/supabase';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';

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

    const { error } = await supabase.from('users').update({ username: trimmed }).eq('id', user.id);

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
    const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';

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

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

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
    <View style={{ flex: 1, padding: 20, paddingTop: 40, backgroundColor: colors.background }}>
      <Text
        style={{
          fontSize: 28,
          textAlign: 'center',
          marginBottom: 30,
          color: colors.text,
          fontFamily: fonts.display,
        }}
      >
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
                    backgroundColor: colors.cardSoft,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: fonts.medium }}>👤</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={pickAndUploadImage}
              style={{
                marginTop: 10,
                padding: 10,
                backgroundColor: colors.primary,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: colors.text, fontFamily: fonts.semiBold }}>
                Changer la photo
              </Text>
            </Pressable>
          </View>

          <TextInput
            value={username}
            onChangeText={setUsername}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.card,
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
              fontFamily: fonts.regular,
            }}
            placeholderTextColor={colors.textMuted}
          />

          <Pressable
            onPress={updateUsername}
            style={{
              backgroundColor: colors.primary,
              padding: 10,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.text, fontFamily: fonts.semiBold }}>Enregistrer</Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            style={{
              backgroundColor: colors.danger,
              padding: 10,
              marginTop: 20,
              borderRadius: 8,
              alignItems: 'center',
              opacity: loading ? 0.5 : 1,
            }}
            disabled={loading}
          >
            <Text style={{ color: colors.text, fontFamily: fonts.semiBold }}>
              {loading ? 'Déconnexion...' : 'Logout'}
            </Text>
          </Pressable>
        </View>
      )}

      <Modal visible={modalVisible} transparent>
        <Pressable
          onPress={() => setModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {user?.avatar_url && (
            <Image source={{ uri: user.avatar_url }} style={{ width: '90%', height: '60%' }} />
          )}
        </Pressable>
      </Modal>
    </View>
  );
}
