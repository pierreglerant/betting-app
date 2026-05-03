import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, View } from 'react-native';
import { BetUserStatus } from '@/presentation/home/types';

type BetStatusBadgeProps = {
  status: BetUserStatus | 'manage' | 'resolved_yes' | 'resolved_no';
};

const ICON_SIZE = 17;

export default function BetStatusBadge({ status }: BetStatusBadgeProps) {
  const map = {
    pending: {
      bg: 'rgba(250, 204, 21, 0.12)',
      border: 'rgba(250, 204, 21, 0.38)',
      text: '#fde047',
      icon: 'clipboard-clock-outline' as const,
      a11yLabel: 'À faire',
    },
    done: {
      bg: 'rgba(34, 197, 94, 0.14)',
      border: 'rgba(34, 197, 94, 0.4)',
      text: '#4ade80',
      icon: 'check' as const,
      a11yLabel: 'OK',
    },
    late: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.42)',
      text: '#f87171',
      icon: 'clock-alert-outline' as const,
      a11yLabel: 'En retard',
    },
    manage: {
      bg: 'rgba(249, 115, 22, 0.14)',
      border: 'rgba(249, 115, 22, 0.45)',
      text: '#fb923c',
      icon: 'cog-outline' as const,
      a11yLabel: 'Gérer',
    },
    resolved_yes: {
      bg: 'rgba(34, 197, 94, 0.14)',
      border: 'rgba(34, 197, 94, 0.4)',
      text: '#4ade80',
      icon: 'thumb-up-outline' as const,
      a11yLabel: 'Oui',
    },
    resolved_no: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.42)',
      text: '#f87171',
      icon: 'thumb-down-outline' as const,
      a11yLabel: 'Non',
    },
  } as const;

  const badge = map[status];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={badge.a11yLabel}
      style={{
        backgroundColor: badge.bg,
        borderWidth: 1,
        borderColor: badge.border,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        ...(Platform.OS === 'web'
          ? { boxShadow: `0 1px 2px rgba(0,0,0,0.25)` as const }
          : {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.22,
              shadowRadius: 2,
              elevation: 2,
            }),
      }}
    >
      <MaterialCommunityIcons name={badge.icon} size={ICON_SIZE} color={badge.text} />
    </View>
  );
}
