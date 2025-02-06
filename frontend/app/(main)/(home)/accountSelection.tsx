import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for back button
import { styles } from "../styles";

export default function AccountSelectionView() {
  const router = useRouter();

  const handleRoleSelection = (role: string) => {
    router.push({
      pathname: "/accountCreation",
      params: { role },
    });
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={{
            position: "absolute",
            top: 110, // Same as before
            left: 20,
            padding: 10,
            backgroundColor: "white",
            borderRadius: 50,
            zIndex: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5, // Android shadow
          }}
        >
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("./assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Select an account type</Text>
          <View style={styles.buttonContainer}>
            {/* Tenant Button */}
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => handleRoleSelection("tenant")}
            >
              <Icon name="account" size={80} color="#fff" />
              <Text style={styles.buttonText}>Tenant</Text>
            </TouchableOpacity>

            {/* Property Owner Button */}
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => handleRoleSelection("landlord")}
            >
              <Icon name="home" size={80} color="#fff" />
              <Text style={styles.buttonText}>Property Owner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaProvider>
  );
}
