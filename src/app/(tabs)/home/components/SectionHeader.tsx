import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  headerAction?: React.ReactNode;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  /** Space below the title row (default 16). */
  marginBottom?: number;
};

export default function SectionHeader({
  title,
  headerAction,
  showSeeAll,
  onSeeAll,
  marginBottom = 16,
}: SectionHeaderProps) {
  const trailing = headerAction || showSeeAll;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom,
      }}
    >
      <View
        style={{
          width: 4,
          borderRadius: 2,
          backgroundColor: colors.primary,
          marginRight: 14,
          alignSelf: 'stretch',
          minHeight: 36,
        }}
      />
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          minWidth: 0,
        }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 28,
            lineHeight: 34,
            color: colors.text,
            fontFamily: fonts.display,
            textTransform: 'uppercase',
            ...Platform.select({ android: { includeFontPadding: false } }),
          }}
        >
          {title}
        </Text>
        {trailing ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexShrink: 0,
              marginLeft: 10,
            }}
          >
            {headerAction ? (
              <View style={{ marginRight: showSeeAll ? 12 : 0 }}>{headerAction}</View>
            ) : null}
            {showSeeAll && onSeeAll ? (
              <Pressable onPress={onSeeAll} hitSlop={10}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: fonts.semiBold,
                      fontSize: 14,
                      lineHeight: 18,
                      ...Platform.select({ android: { includeFontPadding: false } }),
                    }}
                  >
                    Voir tout
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={colors.primary}
                    style={{ marginLeft: 2 }}
                  />
                </View>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
