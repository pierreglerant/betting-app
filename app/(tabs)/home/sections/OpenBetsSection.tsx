import React from "react";
import { View, Text, Pressable } from "react-native";
import { supabase } from "@/libs/supabase";
import { Bet, BetUserStatus, UserLite } from "../types";
import SectionHeader from "../components/SectionHeader";
import BetRow from "../components/BetRow";
import BetStatusBadge from "../components/BetStatusBadge";
import CreateBetModal from "../components/CreateBetModal";
import PredictBetModal from "../components/PredictBetModal";

type OpenBetsSectionProps = {
  userId: string;
  refreshKey: number;
  onDataChanged: () => void;
};

export default function OpenBetsSection({
  userId,
  refreshKey,
  onDataChanged,
}: OpenBetsSectionProps) {
  const [openBets, setOpenBets] = React.useState<Bet[]>([]);
  const [users, setUsers] = React.useState<UserLite[]>([]);
  const [excludedSet, setExcludedSet] = React.useState<Set<string>>(new Set());
  const [predictedSet, setPredictedSet] = React.useState<Set<string>>(new Set());
  const [createModalVisible, setCreateModalVisible] = React.useState(false);
  const [predictionModalVisible, setPredictionModalVisible] = React.useState(false);
  const [currentBet, setCurrentBet] = React.useState<Bet | null>(null);

  const fetchOpenBets = async () => {
    const { data, error } = await supabase
      .from("bets")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching open bets:", error);
      return;
    }

    setOpenBets(data || []);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("id, username");

    if (error) {
      console.error("Error fetching users:", error);
      return;
    }

    setUsers(data || []);
  };

  const fetchUserStatus = async () => {
    const { data: excluded, error: excludedError } = await supabase
      .from("bet_tags")
      .select("bet_id")
      .eq("user_id", userId);

    const { data: predicted, error: predictedError } = await supabase
      .from("predictions")
      .select("bet_id")
      .eq("user_id", userId);

    if (excludedError) {
      console.error("Error fetching excluded bets:", excludedError);
    }

    if (predictedError) {
      console.error("Error fetching predictions:", predictedError);
    }

    setExcludedSet(new Set((excluded || []).map((e) => e.bet_id)));
    setPredictedSet(new Set((predicted || []).map((p) => p.bet_id)));
  };

  const loadAll = async () => {
    await Promise.all([fetchOpenBets(), fetchUsers(), fetchUserStatus()]);
  };

  React.useEffect(() => {
    loadAll();
  }, [userId, refreshKey]);

  const getStatus = (bet: Bet): BetUserStatus => {
    if (excludedSet.has(bet.id)) return "excluded";
    if (predictedSet.has(bet.id)) return "done";
    if (bet.deadline && new Date(bet.deadline) < new Date()) return "late";
    return "pending";
  };

  const handleCreated = () => {
    setCreateModalVisible(false);
    onDataChanged();
  };

  const handlePredicted = () => {
    setPredictionModalVisible(false);
    setCurrentBet(null);
    onDataChanged();
  };

  const renderRightElement = (bet: Bet) => {
    const status = getStatus(bet);

    if (status === "pending") {
      return (
        <Pressable
          onPress={() => {
            setCurrentBet(bet);
            setPredictionModalVisible(true);
          }}
        >
          <BetStatusBadge status="pending" />
        </Pressable>
      );
    }

    return <BetStatusBadge status={status} />;
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
      <SectionHeader
        title="Paris en cours"
        rightElement={
          <Pressable onPress={() => setCreateModalVisible(true)}>
            <BetStatusBadge status="manage" />
          </Pressable>
        }
      />

      {openBets.length === 0 ? (
        <Text>Aucun pari en cours</Text>
      ) : (
        openBets.map((bet) => (
          <BetRow
            key={bet.id}
            title={bet.title}
            context={bet.context}
            deadline={bet.deadline}
            rightElement={renderRightElement(bet)}
          />
        ))
      )}

      <CreateBetModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        creatorId={userId}
        users={users}
        onCreated={handleCreated}
      />

      <PredictBetModal
        visible={predictionModalVisible}
        bet={currentBet}
        userId={userId}
        onClose={() => {
          setPredictionModalVisible(false);
          setCurrentBet(null);
        }}
        onPredicted={handlePredicted}
      />
    </View>
  );
}