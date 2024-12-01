import { useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { styles } from "../styles";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function AccountSelectionView() {
  const router = useRouter();

  const handleRoleSelection = (role: string) => {
    // Navigate to accountCreation with the role as a query parameter
    router.push({
      pathname: "/accountCreation", // Explicitly specify the route name
      params: { role }, // Pass the role parameter
    });
  };

  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          <ThemedText style={styles.title} type="title">
            Select an account type
          </ThemedText>

          <ThemedView style={styles.buttonContainer}>
            {/* Tenant Account Button */}
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => handleRoleSelection("tenant")}
            >
              <Icon name="account" size={80} color="#fff" />
              <ThemedText style={styles.buttonText}>Tenant</ThemedText>
            </TouchableOpacity>

            {/* Property Owner Button */}
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => handleRoleSelection("landlord")}
            >
              <Icon name="home" size={80} color="#fff" />
              <ThemedText style={styles.buttonText}>Property Owner</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
