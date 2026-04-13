import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
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
        <Text style={{ color: colors.text, fontFamily: fonts.semiBold }}>{title}</Text>
        {context ? (
          <Text style={{ color: colors.textMuted, fontFamily: fonts.regular }}>{context}</Text>
        ) : null}
        {deadline ? (
          <Text style={{ color: colors.textMuted, marginTop: 4, fontFamily: fonts.medium }}>
            Fin : {new Date(deadline).toLocaleDateString()}
          </Text>
        ) : null}
      </View>
      {rightElement}
    </View>
  );
}
