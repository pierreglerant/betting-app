import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import React from 'react';
import { Text, View } from 'react-native';

type ModalTitleProps = {
  title: string;
};

export default function ModalTitle({ title }: ModalTitleProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
      }}
    >
      <View
        style={{
          width: 4,
          height: 32,
          borderRadius: 2,
          backgroundColor: colors.primary,
          marginRight: 14,
        }}
      />
      <Text
        style={{
          flex: 1,
          fontSize: 24,
          color: colors.text,
          fontFamily: fonts.display,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Text>
    </View>
  );
}
