import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useAuth } from "@/contexts/auth-context";
import OpenBetsSection from "./sections/OpenBetsSection";
import MyLaunchedBetsSection from "./sections/MyLaunchedBetsSection";
import FinishedBetsSection from "./sections/FinishedBetsSection";

export default function HomeScreen() {
  const { user, isLoading } = useAuth();
  const [refreshKey, setRefreshKey] = React.useState(0);

  const refreshAll = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <View style={{ marginTop: 100 }}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Bienvenue {user.username} 🍻
      </Text>

      <OpenBetsSection
        userId={user.id}
        refreshKey={refreshKey}
        onDataChanged={refreshAll}
      />

      <MyLaunchedBetsSection
        userId={user.id}
        refreshKey={refreshKey}
        onDataChanged={refreshAll}
      />

      <FinishedBetsSection refreshKey={refreshKey} />
    </ScrollView>
  );
}