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

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20, alignItems: 'center' }}>
              <TextInput
                value={username}
                onChangeText={setUsername}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderRadius: 8,
                  padding: 12,
                  fontFamily: fonts.regular,
                }}
                placeholderTextColor={colors.textMuted}
              />

              <Pressable
                onPress={updateUsername}
                style={({ pressed }) => ({
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ color: colors.text, fontFamily: fonts.semiBold, fontSize: 14 }}>
                  Enregistrer
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => ({
                marginTop: 16,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderColor: '#ef4444',
                opacity: loading ? 0.5 : pressed ? 0.85 : 1,
              })}
              disabled={loading}
            >
              <Text style={{ color: '#ef4444', fontFamily: fonts.semiBold, fontSize: 14 }}>
                {loading ? 'Déconnexion...' : 'Déconnexion'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
