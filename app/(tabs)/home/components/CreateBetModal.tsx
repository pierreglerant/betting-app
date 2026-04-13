import React from "react";
import {
  Text,
  TextInput,
  Button,
  Platform,
  ScrollView,
  Pressable,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import BaseModal from "./BaseModal";
import { supabase } from "@/libs/supabase";
import { UserLite } from "../types";

type CreateBetModalProps = {
  visible: boolean;
  onClose: () => void;
  creatorId: string;
  users: UserLite[];
  onCreated: () => void;
};

export default function CreateBetModal({
  visible,
  onClose,
  creatorId,
  users,
  onCreated,
}: CreateBetModalProps) {
  const [newTitle, setNewTitle] = React.useState("");
  const [newContext, setNewContext] = React.useState("");
  const [deadline, setDeadline] = React.useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState({
    title: false,
    context: false,
  });

  const resetForm = () => {
    setNewTitle("");
    setNewContext("");
    setDeadline(null);
    setSelectedUsers([]);
    setErrors({ title: false, context: false });
    setShowDatePicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateBet = async () => {
    const titleError = !newTitle.trim();
    const contextError = !newContext.trim();

    setErrors({
      title: titleError,
      context: contextError,
    });

    if (titleError || contextError) return;

    const { data: bet, error } = await supabase
      .from("bets")
      .insert({
        title: newTitle.trim(),
        context: newContext.trim(),
        deadline: deadline ? deadline.toISOString() : null,
        creator_id: creatorId,
        status: "open",
      })
      .select()
      .single();

    if (error || !bet) {
      console.error("Error creating bet:", error);
      return;
    }

    if (selectedUsers.length > 0) {
      const tags = selectedUsers.map((userId) => ({
        bet_id: bet.id,
        user_id: userId,
      }));

      const { error: tagsError } = await supabase.from("bet_tags").insert(tags);

      if (tagsError) {
        console.error("Error creating bet tags:", tagsError);
      }
    }

    resetForm();
    onClose();
    onCreated();
  };

  return (
    <BaseModal visible={visible} onClose={handleClose}>
      <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
        Créer un pari
      </Text>

      <TextInput
        placeholder="Titre"
        value={newTitle}
        onChangeText={setNewTitle}
        style={{
          borderWidth: 1,
          borderColor: errors.title ? "red" : "#ccc",
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Contexte"
        value={newContext}
        onChangeText={setNewContext}
        multiline
        style={{
          borderWidth: 1,
          borderColor: errors.context ? "red" : "#ccc",
          padding: 10,
          height: 80,
          marginBottom: 10,
          borderRadius: 8,
          textAlignVertical: "top",
        }}
      />

      <Button
        title={deadline ? deadline.toLocaleDateString() : "Choisir une date"}
        onPress={() => setShowDatePicker(true)}
      />

      {showDatePicker ? (
        <DateTimePicker
          value={deadline || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setDeadline(date);
          }}
        />
      ) : null}

      <Text style={{ marginTop: 15, marginBottom: 5 }}>
        Participants à exclure
      </Text>

      <ScrollView style={{ maxHeight: 150 }}>
        {users.map((u) => {
          const selected = selectedUsers.includes(u.id);

          return (
            <Pressable
              key={u.id}
              onPress={() => toggleUser(u.id)}
              style={{
                padding: 10,
                marginBottom: 5,
                backgroundColor: selected ? "#2563eb" : "#eee",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: selected ? "white" : "black" }}>
                {u.username}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ marginTop: 15 }}>
        <Button title="Créer" onPress={handleCreateBet} />
      </View>
    </BaseModal>
  );
}