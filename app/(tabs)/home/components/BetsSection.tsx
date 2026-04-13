import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import React from 'react';
import { Text, View } from 'react-native';
import SectionHeader from './SectionHeader';

type BetsSectionProps = {
  title: string;
  rightElement?: React.ReactNode;
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
};

export default function BetsSection({
  title,
  rightElement,
  isEmpty,
  emptyMessage,
  children,
}: BetsSectionProps) {
  return (
    <View
      style={{
        padding: 10,
        borderRadius: 12,
        marginBottom: 20,
      }}
    >
      <SectionHeader title={title} rightElement={rightElement} />

      {isEmpty ? (
        <Text style={{ color: colors.textMuted, fontFamily: fonts.medium }}>{emptyMessage}</Text>
      ) : (
        children
      )}
    </View>
  );
}
