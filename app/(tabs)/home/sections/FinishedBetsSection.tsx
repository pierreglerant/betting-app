import React from "react";
import { View, Text } from "react-native";
import { supabase } from "@/libs/supabase";
import { Bet } from "../types";
import SectionHeader from "../components/SectionHeader";
import BetRow from "../components/BetRow";
import BetStatusBadge from "../components/BetStatusBadge";

type FinishedBetsSectionProps = {
  refreshKey: number;
};

export default function FinishedBetsSection({
  refreshKey,
}: FinishedBetsSectionProps) {
  const [bets, setBets] = React.useState<Bet[]>([]);

  const fetchFinishedBets = async () => {
    const { data, error } = await supabase
      .from("bets")
      .select("*")
      .eq("status", "resolved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching finished bets:", error);
      return;
    }

    setBets(data || []);
  };

  React.useEffect(() => {
    fetchFinishedBets();
  }, [refreshKey]);

  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
      }}
    >
      <SectionHeader title="Historique des paris finis" />

      {bets.length === 0 ? (
        <Text>Aucun pari fini</Text>
      ) : (
        bets.map((bet) => (
          <BetRow
            key={bet.id}
            title={bet.title}
            context={bet.context}
            deadline={bet.deadline}
            rightElement={
              bet.result === "yes" ? (
                <BetStatusBadge status="resolved_yes" />
              ) : bet.result === "no" ? (
                <BetStatusBadge status="resolved_no" />
              ) : null
            }
          />
        ))
      )}
    </View>
  );
}