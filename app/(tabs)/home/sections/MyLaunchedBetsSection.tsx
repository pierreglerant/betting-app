import React from "react";
import { View, Text, Pressable } from "react-native";
import { supabase } from "@/libs/supabase";
import { Bet } from "../types";
import SectionHeader from "../components/SectionHeader";
import BetRow from "../components/BetRow";
import BetStatusBadge from "../components/BetStatusBadge";
import ResolveBetModal from "../components/ResolveBetModal";

type MyLaunchedBetsSectionProps = {
  userId: string;
  refreshKey: number;
  onDataChanged: () => void;
};

export default function MyLaunchedBetsSection({
  userId,
  refreshKey,
  onDataChanged,
}: MyLaunchedBetsSectionProps) {
  const [bets, setBets] = React.useState<Bet[]>([]);
  const [manageModalVisible, setManageModalVisible] = React.useState(false);
  const [currentBet, setCurrentBet] = React.useState<Bet | null>(null);

  const fetchMyLaunchedBets = async () => {
    const { data, error } = await supabase
      .from("bets")
      .select("*")
      .eq("creator_id", userId)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching my launched bets:", error);
      return;
    }

    setBets(data || []);
  };

  React.useEffect(() => {
    fetchMyLaunchedBets();
  }, [userId, refreshKey]);

  const handleChanged = () => {
    setManageModalVisible(false);
    setCurrentBet(null);
    onDataChanged();
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
      }}
    >
      <SectionHeader title="Mes paris lancés" />

      {bets.length === 0 ? (
        <Text>Aucun pari lancé en cours</Text>
      ) : (
        bets.map((bet) => (
          <BetRow
            key={bet.id}
            title={bet.title}
            context={bet.context}
            deadline={bet.deadline}
            rightElement={
              <Pressable
                onPress={() => {
                  setCurrentBet(bet);
                  setManageModalVisible(true);
                }}
              >
                <BetStatusBadge status="manage" />
              </Pressable>
            }
          />
        ))
      )}

      <ResolveBetModal
        visible={manageModalVisible}
        bet={currentBet}
        onClose={() => {
          setManageModalVisible(false);
          setCurrentBet(null);
        }}
        onChanged={handleChanged}
      />
    </View>
  );
}