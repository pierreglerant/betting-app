import { colors } from '@/constants/theme';
import React from 'react';
import { Text, View } from 'react-native';

type BetRowProps = {
  title: string;
  context?: string | null;
  deadline?: string | null;
  rightElement?: React.ReactNode;
};

export default function BetRow({ title, context, deadline, rightElement }: BetRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontWeight: 'bold', color: colors.text }}>{title}</Text>
        {context ? <Text style={{ color: colors.textMuted }}>{context}</Text> : null}
        {deadline ? (
          <Text style={{ color: colors.textMuted, marginTop: 4 }}>
            Fin : {new Date(deadline).toLocaleDateString()}
          </Text>
        ) : null}
      </View>
      {rightElement}
    </View>
  );
}
