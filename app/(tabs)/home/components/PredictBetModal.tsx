import React from "react";
import { Text, View, Button, TextInput } from "react-native";
import BaseModal from "./BaseModal";
import { supabase } from "@/libs/supabase";
import { Bet, PredictionChoice } from "../types";

type PredictBetModalProps = {
  visible: boolean;
  bet: Bet | null;
  userId: string;
  onClose: () => void;
  onPredicted: () => void;
};

export default function PredictBetModal({
  visible,
  bet,
  userId,
  onClose,
  onPredicted,
}: PredictBetModalProps) {
  const [choice, setChoice] = React.useState<PredictionChoice | null>(null);
  const [amount, setAmount] = React.useState("");

  React.useEffect(() => {
    if (!visible) {
      setChoice(null);
      setAmount("");
    }
  }, [visible]);

  const handlePredict = async () => {
    if (!bet || !choice || !amount.trim()) return;

    const parsedAmount = parseInt(amount, 10);
    if (Number.isNaN(parsedAmount)) return;

    const { error } = await supabase.from("predictions").insert({
      bet_id: bet.id,
      user_id: userId,
      choice,
      amount: parsedAmount,
    });

    if (error) {
      console.error("Error creating prediction:", error);
      return;
    }

    onClose();
    onPredicted();
  };

  return (
    <BaseModal visible={visible} onClose={onClose} width="80%">
      <Text style={{ marginBottom: 10, fontWeight: "bold" }}>
        Faire un pari
      </Text>

      {bet ? <Text style={{ marginBottom: 10 }}>{bet.title}</Text> : null}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button title="Oui" onPress={() => setChoice("yes")} />
        <Button title="Non" onPress={() => setChoice("no")} />
      </View>

      <Text style={{ marginTop: 10 }}>
        Choix : {choice === "yes" ? "Oui" : choice === "no" ? "Non" : "-"}
      </Text>

      <TextInput
        placeholder="Montant"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          marginTop: 10,
          padding: 10,
          borderRadius: 8,
        }}
      />

      <View style={{ marginTop: 15 }}>
        <Button title="Valider" onPress={handlePredict} />
      </View>
    </BaseModal>
  );
}