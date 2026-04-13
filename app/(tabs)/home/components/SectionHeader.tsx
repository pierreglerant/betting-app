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
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: rightElement ? 12 : 0,
        }}
      >
        <View
          style={{
            width: 4,
            height: 36,
            borderRadius: 2,
            backgroundColor: colors.primary,
            marginRight: 14,
          }}
        />
        <Text
          style={{
            flex: 1,
            fontSize: 28,
            color: colors.text,
            fontFamily: fonts.display,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Text>
      </View>
      {rightElement}
    </View>
  );
}
