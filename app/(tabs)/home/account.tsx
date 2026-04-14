import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/libs/supabase';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function AccountScreen() {
  const { user, logout, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 15,
          paddingTop: 40,
          paddingBottom: 15,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          minHeight: 70,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <FontAwesome5
              name="arrow-left"
              size={24}
              color={colors.text}
              style={{ marginRight: 12 }}
            />
          </Pressable>

          <Text
            style={{
              fontSize: 24,
              color: colors.text,
              fontFamily: fonts.display,
            }}
          >
            Mon Compte
          </Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
      >
        {user && (
          <View style={{ flex: 1 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Pressable onPress={pickAndUploadImage}>
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
                    <Text style={{ fontFamily: fonts.medium, fontSize: 40 }}>👤</Text>
                  </View>
                )}
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
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.primaryDark : colors.primary,
                paddingVertical: 14,
                paddingHorizontal: 22,
                borderRadius: 14,
                alignItems: 'center',
                transform: [{ scale: pressed ? 0.98 : 1 }],
                ...(Platform.OS === 'web'
                  ? {
                      boxShadow: pressed
                        ? '0 4px 16px rgba(249, 115, 22, 0.28)'
                        : '0 8px 28px rgba(249, 115, 22, 0.38)',
                    }
                  : {}),
                ...(Platform.OS === 'ios'
                  ? {
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.35,
                      shadowRadius: 10,
                    }
                  : {}),
                ...(Platform.OS === 'android' ? { elevation: pressed ? 3 : 5 } : {}),
              })}
            >
              <Text style={{ color: colors.text, fontFamily: fonts.semiBold, fontSize: 15 }}>
                Enregistrer
              </Text>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => ({
                marginTop: 22,
                paddingVertical: 14,
                paddingHorizontal: 22,
                borderRadius: 14,
                alignItems: 'center',
                backgroundColor: pressed ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.12)',
                borderWidth: 1.5,
                borderColor: 'rgba(239, 68, 68, 0.5)',
                opacity: loading ? 0.5 : 1,
                transform: [{ scale: pressed && !loading ? 0.98 : 1 }],
              })}
              disabled={loading}
            >
              <Text style={{ color: '#f87171', fontFamily: fonts.semiBold, fontSize: 15 }}>
                {loading ? 'Déconnexion...' : 'Logout'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
