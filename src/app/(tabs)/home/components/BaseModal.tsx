import { colors } from '@/constants/theme';
import React from 'react';
import { DimensionValue, Modal, Pressable, StyleSheet, View } from 'react-native';

type BaseModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: DimensionValue;
};

export default function BaseModal({ visible, onClose, children, width = '90%' }: BaseModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Pressable
          accessibilityRole="button"
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={onClose}
        />
        <View
          pointerEvents="box-none"
          style={{
            width,
            maxWidth: '100%',
            zIndex: 1,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
              padding: 20,
              borderRadius: 12,
            }}
          >
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}
