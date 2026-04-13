import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import React from 'react';
import { Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  rightElement?: React.ReactNode;
};

export default function SectionHeader({ title, rightElement }: SectionHeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          color: colors.text,
          fontFamily: fonts.display,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Text>
      {rightElement}
    </View>
  );
}
