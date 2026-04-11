import React from "react";
import {
  View,
  Text,
  Button,
  Modal,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "@/libs/supabase";
import { useAuth } from "@/contexts/auth-context";

type Bet = {
  id: string;
  title: string;
  context?: string;
  creator_id: string;
  deadline?: string;
  status: string;
  result?: string;
  result_image_url?: string;
  created_at: string;
};

type User = {
  id: string;
  username: string;
};

const OpenBetsScreen = () => {
  const [openBets, setOpenBets] = React.useState<Bet[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newContext, setNewContext] = React.useState("");
  const [deadline, setDeadline] = React.useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const [errors, setErrors] = React.useState({
    title: false,
    context: false,
  });

  const { user } = useAuth();

  const fetchOpenBets = async () => {
    const { data } = await supabase
      .from("bets")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    setOpenBets(data || []);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("id, username");
    setUsers(data || []);
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleNewBet = async () => {
    const titleError = !newTitle;
    const contextError = !newContext;

    setErrors({
      title: titleError,
      context: contextError,
    });

    if (!user || titleError || contextError) return;

    const { data: bet, error } = await supabase
      .from("bets")
      .insert({
        title: newTitle,
        context: newContext,
        deadline: deadline ? deadline.toISOString() : null,
        creator_id: user.id,
        status: "open",
      })
      .select()
      .single();

    if (error || !bet) {
      console.error(error);
      return;
    }

    if (selectedUsers.length > 0) {
      const tags = selectedUsers.map((userId) => ({
        bet_id: bet.id,
        user_id: userId,
      }));

      await supabase.from("bet_tags").insert(tags);
    }

    setNewTitle("");
    setNewContext("");
    setDeadline(null);
    setSelectedUsers([]);
    setErrors({ title: false, context: false });
    setModalVisible(false);

    fetchOpenBets();
  };

  React.useEffect(() => {
    fetchOpenBets();
    fetchUsers();
  }, []);

  return (
    <View
      style={{
        marginTop: 20,
        width: "100%",
        paddingHorizontal: 20,
        backgroundColor: "#fff",
        padding: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Paris en cours
        </Text>
        <Button title="Nouveau pari" onPress={() => setModalVisible(true)} />
      </View>

      {openBets.length === 0 ? (
        <Text>Aucun pari en cours</Text>
      ) : (
        openBets.map((bet) => (
          <View key={bet.id} style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: "bold" }}>{bet.title}</Text>
            {bet.context && <Text>{bet.context}</Text>}
            {bet.deadline && (
              <Text>{new Date(bet.deadline).toLocaleDateString()}</Text>
            )}
          </View>
        ))
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              width: "90%",
              backgroundColor: "white",
              padding: 20,
              borderRadius: 12,
            }}
          >
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
              }}
            />

            <Button
              title={
                deadline
                  ? deadline.toLocaleDateString()
                  : "Choisir une date"
              }
              onPress={() => setShowDatePicker(true)}
            />

            {showDatePicker && (
              <DateTimePicker
                value={deadline || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, date) => {
                  setShowDatePicker(false);
                  if (date) setDeadline(date);
                }}
              />
            )}

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
              <Button title="Créer" onPress={handleNewBet} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default OpenBetsScreen;