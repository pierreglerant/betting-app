import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import React from 'react';
import { Text, View } from 'react-native';
import SectionHeader from './SectionHeader';

type BetsSectionProps = {
  title: string;
  headerAction?: React.ReactNode;
  /** Renders under the section title, above the list or empty state. */
  belowHeader?: React.ReactNode;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
};

export default function BetsSection({
  title,
  headerAction,
  belowHeader,
  showSeeAll,
  onSeeAll,
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
      <SectionHeader
        title={title}
        headerAction={headerAction}
        showSeeAll={showSeeAll}
        onSeeAll={onSeeAll}
        marginBottom={belowHeader ? 4 : 16}
      />

      {belowHeader ? <View style={{ marginBottom: 12 }}>{belowHeader}</View> : null}

      {isEmpty ? (
        <Text style={{ color: colors.textMuted, fontFamily: fonts.medium }}>{emptyMessage}</Text>
      ) : (
        children
      )}
    </View>
  );
}
