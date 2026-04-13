import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import React from 'react';
import { Text, View } from 'react-native';
import { BetUserStatus } from '../types';

type BetStatusBadgeProps = {
  status: BetUserStatus | 'manage' | 'resolved_yes' | 'resolved_no';
};

export default function BetStatusBadge({ status }: BetStatusBadgeProps) {
  const map = {
    excluded: { color: colors.textMuted, label: 'Exclu' },
    pending: { color: colors.accent, label: 'À faire' },
    done: { color: colors.success, label: 'OK' },
    late: { color: colors.danger, label: 'En retard' },
    manage: { color: colors.primary, label: 'Gérer' },
    resolved_yes: { color: colors.success, label: 'Oui' },
    resolved_no: { color: colors.danger, label: 'Non' },
  } as const;

  const badge = map[status];

  return (
    <View
      style={{
        backgroundColor: badge.color,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 12, fontFamily: fonts.semiBold }}>
        {badge.label}
      </Text>
    </View>
  );
}
