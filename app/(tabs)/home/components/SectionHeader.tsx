import React from "react";
import { View, Text } from "react-native";

type SectionHeaderProps = {
  title: string;
  rightElement?: React.ReactNode;
};

export default function SectionHeader({
  title,
  rightElement,
}: SectionHeaderProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>{title}</Text>
      {rightElement}
    </View>
  );
}