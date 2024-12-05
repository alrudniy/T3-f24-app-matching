import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { styles} from "../styles"

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
      {/* Full Screen Container */}
      <View style={styles.container}>
        {/* Fixed Header */}
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
