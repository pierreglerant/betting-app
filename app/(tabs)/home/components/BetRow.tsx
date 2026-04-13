import React from "react";
import { View, Text } from "react-native";

type BetRowProps = {
  title: string;
  context?: string | null;
  deadline?: string | null;
  rightElement?: React.ReactNode;
};

export default function BetRow({
  title,
  context,
  deadline,
  rightElement,
}: BetRowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontWeight: "bold" }}>{title}</Text>
        {context ? <Text>{context}</Text> : null}
        {deadline ? (
          <Text style={{ color: "#666", marginTop: 4 }}>
            Fin : {new Date(deadline).toLocaleDateString()}
          </Text>
        ) : null}
      </View>
      {rightElement}
    </View>
  );
}