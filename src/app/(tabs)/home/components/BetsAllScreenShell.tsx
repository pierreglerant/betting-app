import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

type BetsAllScreenShellProps = {
  title: string;
  emptyMessage: string;
  reload: () => void;
  isEmpty: boolean;
  listHeader?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function BetsAllScreenShell({
  title,
  emptyMessage,
  reload,
  isEmpty,
  listHeader,
  children,
  footer,
}: BetsAllScreenShellProps) {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            paddingTop: 40,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <FontAwesome5
              name="arrow-left"
              size={24}
              color={colors.primary}
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
            {title}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
          {listHeader}
          {isEmpty ? (
            <Text style={{ color: colors.textMuted, fontFamily: fonts.medium }}>
              {emptyMessage}
            </Text>
          ) : (
            children
          )}
        </ScrollView>
      </View>
      {footer}
    </>
  );
}
