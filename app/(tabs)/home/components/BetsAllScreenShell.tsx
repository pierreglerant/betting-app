import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { useFocusEffect } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React, { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';

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
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontFamily: fonts.display },
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
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
