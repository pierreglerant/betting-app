import React from "react";
import { Text, View, Button } from "react-native";
import BaseModal from "./BaseModal";
import { supabase } from "@/libs/supabase";
import { Bet } from "../types";

type ResolveBetModalProps = {
  visible: boolean;
  bet: Bet | null;
  onClose: () => void;
  onChanged: () => void;
};

export default function ResolveBetModal({
  visible,
  bet,
  onClose,
  onChanged,
}: ResolveBetModalProps) {
  const resolveBet = async (result: "yes" | "no") => {
    if (!bet) return;

    const { error } = await supabase
      .from("bets")
      .update({
        status: "resolved",
        result,
      })
      .eq("id", bet.id);

    if (error) {
      console.error("Error resolving bet:", error);
      return;
    }

    onClose();
    onChanged();
  };

  const deleteBet = async () => {
    if (!bet) return;

    const { error: commentsError } = await supabase
      .from("comments")
      .delete()
      .eq("bet_id", bet.id);

    if (commentsError) {
      console.error("Error deleting comments:", commentsError);
      return;
    }

    const { error: predictionsError } = await supabase
      .from("predictions")
      .delete()
      .eq("bet_id", bet.id);

    if (predictionsError) {
      console.error("Error deleting predictions:", predictionsError);
      return;
    }

    const { error: tagsError } = await supabase
      .from("bet_tags")
      .delete()
      .eq("bet_id", bet.id);

    if (tagsError) {
      console.error("Error deleting bet tags:", tagsError);
      return;
    }

    const { error: betError } = await supabase
      .from("bets")
      .delete()
      .eq("id", bet.id);

    if (betError) {
      console.error("Error deleting bet:", betError);
      return;
    }

    onClose();
    onChanged();
  };

  return (
    <BaseModal visible={visible} onClose={onClose} width="80%">
      <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
        Gérer le pari
      </Text>

      {bet ? <Text style={{ marginBottom: 15 }}>{bet.title}</Text> : null}

      <View style={{ marginBottom: 10 }}>
        <Button title="Résultat : Oui" onPress={() => resolveBet("yes")} />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Button title="Résultat : Non" onPress={() => resolveBet("no")} />
      </View>

      <Button title="Supprimer le pari" onPress={deleteBet} color="#dc2626" />
    </BaseModal>
  );
}