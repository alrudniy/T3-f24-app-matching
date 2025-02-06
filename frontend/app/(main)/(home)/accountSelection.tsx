import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
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
