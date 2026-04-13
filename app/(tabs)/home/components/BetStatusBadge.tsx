import React from "react";
import { Text, View } from "react-native";
import { BetUserStatus } from "../types";

type BetStatusBadgeProps = {
  status: BetUserStatus | "manage" | "resolved_yes" | "resolved_no";
};

export default function BetStatusBadge({ status }: BetStatusBadgeProps) {
  const map = {
    excluded: { color: "#9ca3af", label: "Exclu" },
    pending: { color: "#f59e0b", label: "À faire" },
    done: { color: "#16a34a", label: "OK" },
    late: { color: "#dc2626", label: "En retard" },
    manage: { color: "#2563eb", label: "Gérer" },
    resolved_yes: { color: "#16a34a", label: "Oui" },
    resolved_no: { color: "#dc2626", label: "Non" },
  } as const;

  const badge = map[status];

  return (
    <View
      style={{
        backgroundColor: badge.color,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
        {badge.label}
      </Text>
    </View>
  );
}