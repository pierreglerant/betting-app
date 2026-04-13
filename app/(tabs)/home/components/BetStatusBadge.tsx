import { fonts } from '@/constants/typography';
import React from 'react';
import { Platform, Text, View } from 'react-native';
import { BetUserStatus } from '../types';

type BetStatusBadgeProps = {
  status: BetUserStatus | 'manage' | 'resolved_yes' | 'resolved_no';
};

export default function BetStatusBadge({ status }: BetStatusBadgeProps) {
  const map = {
    excluded: {
      bg: 'rgba(156, 163, 175, 0.14)',
      border: 'rgba(156, 163, 175, 0.35)',
      text: '#d1d5db',
      label: 'Exclu',
    },
    pending: {
      bg: 'rgba(250, 204, 21, 0.12)',
      border: 'rgba(250, 204, 21, 0.38)',
      text: '#fde047',
      label: 'À faire',
    },
    done: {
      bg: 'rgba(34, 197, 94, 0.14)',
      border: 'rgba(34, 197, 94, 0.4)',
      text: '#4ade80',
      label: 'OK',
    },
    late: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.42)',
      text: '#f87171',
      label: 'En retard',
    },
    manage: {
      bg: 'rgba(249, 115, 22, 0.14)',
      border: 'rgba(249, 115, 22, 0.45)',
      text: '#fb923c',
      label: 'Gérer',
    },
    resolved_yes: {
      bg: 'rgba(34, 197, 94, 0.14)',
      border: 'rgba(34, 197, 94, 0.4)',
      text: '#4ade80',
      label: 'Oui',
    },
    resolved_no: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.42)',
      text: '#f87171',
      label: 'Non',
    },
  } as const;

  const badge = map[status];

  return (
    <View
      style={{
        backgroundColor: badge.bg,
        borderWidth: 1,
        borderColor: badge.border,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
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
      <Text
        style={{
          color: badge.text,
          fontSize: 11,
          fontFamily: fonts.semiBold,
          letterSpacing: 0.35,
          textTransform: 'uppercase',
        }}
      >
        {badge.label}
      </Text>
    </View>
  );
}
