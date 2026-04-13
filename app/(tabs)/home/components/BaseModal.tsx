import React from "react";
import { Modal, Pressable, DimensionValue } from "react-native";

type BaseModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: DimensionValue;
};

export default function BaseModal({
  visible,
  onClose,
  children,
  width = "90%",
}: BaseModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{
            width,
            backgroundColor: "white",
            padding: 20,
            borderRadius: 12,
          }}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}