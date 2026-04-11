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

  const [excludedSet, setExcludedSet] = React.useState<Set<string>>(new Set());
  const [predictedSet, setPredictedSet] = React.useState<Set<string>>(new Set());

  const [createModalVisible, setCreateModalVisible] = React.useState(false);
  const [predictionModalVisible, setPredictionModalVisible] = React.useState(false);
  const [currentBet, setCurrentBet] = React.useState<Bet | null>(null);

  const [choice, setChoice] = React.useState<"yes" | "no" | null>(null);
  const [amount, setAmount] = React.useState("");

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
    if (!user) return;

    const { data: excluded, error: excludedError } = await supabase
      .from("bet_tags")
      .select("bet_id")
      .eq("user_id", user.id);

    const { data: predicted, error: predictedError } = await supabase
      .from("predictions")
      .select("bet_id")
      .eq("user_id", user.id);

    if (excludedError) {
      console.error("Error fetching excluded bets:", excludedError);
    }

    if (predictedError) {
      console.error("Error fetching predictions:", predictedError);
    }

    setExcludedSet(new Set((excluded || []).map((e) => e.bet_id)));
    setPredictedSet(new Set((predicted || []).map((p) => p.bet_id)));
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getStatus = (bet: Bet) => {
    if (excludedSet.has(bet.id)) return "excluded";
    if (predictedSet.has(bet.id)) return "done";
    if (bet.deadline && new Date(bet.deadline) < new Date()) return "late";
    return "pending";
  };

  const handleCreateBet = async () => {
    const titleError = !newTitle.trim();
    const contextError = !newContext.trim();

    setErrors({
      title: titleError,
      context: contextError,
    });

    if (!user || titleError || contextError) return;

    const { data: bet, error } = await supabase
      .from("bets")
      .insert({
        title: newTitle.trim(),
        context: newContext.trim(),
        deadline: deadline ? deadline.toISOString() : null,
        creator_id: user.id,
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

    setNewTitle("");
    setNewContext("");
    setDeadline(null);
    setSelectedUsers([]);
    setErrors({ title: false, context: false });
    setCreateModalVisible(false);

    fetchOpenBets();
    fetchUserStatus();
  };

  const handlePredict = async () => {
    if (!user || !currentBet || !choice || !amount.trim()) return;

    const parsedAmount = parseInt(amount, 10);
    if (Number.isNaN(parsedAmount)) return;

    const { error } = await supabase.from("predictions").insert({
      bet_id: currentBet.id,
      user_id: user.id,
      choice,
      amount: parsedAmount,
    });

    if (error) {
      console.error("Error creating prediction:", error);
      return;
    }

    setPredictionModalVisible(false);
    setCurrentBet(null);
    setChoice(null);
    setAmount("");

    fetchUserStatus();
  };

  const renderBadge = (bet: Bet) => {
    const status = getStatus(bet);

    const map = {
      excluded: { color: "#9ca3af", label: "Exclu" },
      pending: { color: "#f59e0b", label: "À faire" },
      done: { color: "#16a34a", label: "OK" },
      late: { color: "#dc2626", label: "En retard" },
    };

    const badge = map[status as keyof typeof map];

    return (
      <Pressable
        onPress={() => {
          if (status === "pending") {
            setCurrentBet(bet);
            setPredictionModalVisible(true);
          }
        }}
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
      </Pressable>
    );
  };

  React.useEffect(() => {
    fetchOpenBets();
    fetchUsers();
    fetchUserStatus();
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
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Paris en cours
        </Text>
        <Button title="Nouveau pari" onPress={() => setCreateModalVisible(true)} />
      </View>

      {openBets.length === 0 ? (
        <Text>Aucun pari en cours</Text>
      ) : (
        openBets.map((bet) => (
          <View
            key={bet.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontWeight: "bold" }}>{bet.title}</Text>
              {bet.context && <Text>{bet.context}</Text>}
              {bet.deadline && (
                <Text style={{ color: "#666", marginTop: 4 }}>
                  Fin : {new Date(bet.deadline).toLocaleDateString()}
                </Text>
              )}
            </View>

            {renderBadge(bet)}
          </View>
        ))
      )}

      <Modal visible={createModalVisible} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setCreateModalVisible(false)}
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

            {showDatePicker && (
              <DateTimePicker
                value={deadline || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
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
              <Button title="Créer" onPress={handleCreateBet} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={predictionModalVisible} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setPredictionModalVisible(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              width: "80%",
              backgroundColor: "white",
              padding: 20,
              borderRadius: 12,
            }}
          >
            <Text style={{ marginBottom: 10, fontWeight: "bold" }}>
              Faire un pari
            </Text>

            {currentBet && (
              <Text style={{ marginBottom: 10 }}>{currentBet.title}</Text>
            )}

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
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default OpenBetsScreen;