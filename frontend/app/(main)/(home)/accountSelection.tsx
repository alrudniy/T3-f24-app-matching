import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the back arrow
import { general, button, image, container, text } from "../styles";

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
      <View style={container.base}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={{
            position: "absolute",
            top: 120, // Adjust the top position
            left: 20,
            padding: 10,
            backgroundColor: "white",
            borderRadius: 50,
            zIndex: 1000, // Higher zIndex
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5, // Android shadow
          }}
        >
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>

        {/* Fixed Header */}
        <View style={container.header}>
          <Image
            source={require("./assets/images/logo.png")}
            style={image.logo}
            resizeMode="contain"
          />
        </View>

        {/* Main Content */}
        <View style={container.content}>
          <Text style={text.title}>Select an account type</Text>
          <View style={container.button}>
            {/* Tenant Button */}
            <TouchableOpacity
              style={button.square}
              onPress={() => handleRoleSelection("tenant")}
            >
              <Icon name="account" size={80} color="#fff" />
              <Text style={button.baseText}>Tenant</Text>
            </TouchableOpacity>

            {/* Property Owner Button */}
            <TouchableOpacity
              style={button.square}
              onPress={() => handleRoleSelection("landlord")}
            >
              <Icon name="home" size={80} color="#fff" />
              <Text style={button.baseText}>Property Owner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaProvider>
  );
}
