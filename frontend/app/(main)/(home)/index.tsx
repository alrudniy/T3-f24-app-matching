import React, { useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  View,
  Text,
  Image,
} from "react-native"; // Added Image
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { general, button, image, container, text } from "../styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // Importing Ionicons for the toggle icon
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { useRouter } from "expo-router"; // Import useRouter for navigation

export default function HomeView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (email.trim() === "" || password.trim() === "") {
      setErrorMessage("Please enter both username and password");
      setIsErrorVisible(true); // Show the error modal
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
        credentials: "include", // Include cookies in the request
      });

      const data = await response.json();

      if (response.status === 200 && data.success) {
        // Optional: Save a "logged in" flag in AsyncStorage
        await AsyncStorage.setItem("isLoggedIn", "true");

        Alert.alert("Success", data.message);

        // Check the user's role from the response
        const userRole = data.user.role;
        if (userRole === "tenant") {
          router.push("/matching"); // Route for tenants
        } else if (userRole === "landlord") {
          router.push("/(main)/properties"); // Route for landlords
        } else {
          // fallback if role is something else
          Alert.alert("Info", "Logged in, but role not recognized.");
        }
      } else {
        setErrorMessage(data.message || "Invalid login credentials");
        setIsErrorVisible(true);
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
      setIsErrorVisible(true);
      console.error("Login error:", error);
    }
  };

  return (
    <SafeAreaProvider>
      <ThemedView style={container.base}>
        <SafeAreaView style={container.inner}>
          {/* Logo */}
          <View style={container.logo}>
            <Image
              source={require("./assets/images/logo.png")} // Path to your logo image
              style={image.logo}
              resizeMode="contain"
            />
          </View>

          {/* Login Title */}
          <Text style={text.title}>Login</Text>

          {/* Username Input */}
          <TextInput
            style={container.input}
            placeholder="Username"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <View style={container.password}>
            <TextInput
              style={container.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
            />
            {/* Toggle visibility button */}
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={button.toggle}
            >
              <Ionicons
                name={passwordVisible ? "eye-off" : "eye"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={button.base} onPress={handleLogin}>
            <ThemedText style={button.baseText}>Login</ThemedText>
          </TouchableOpacity>

          {/* Forgot Password and Create Account Links */}
          <Text style={text.footer}>Forgot your password?</Text>
          <Text style={text.footer}>
            Do not have an account?{" "}
            <Text
              onPress={() => router.push("/accountSelection")}
              style={text.link}
            >
              Create one
            </Text>
          </Text>
        </SafeAreaView>

        {/* Error Modal */}
        <Modal
          visible={isErrorVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsErrorVisible(false)}
        >
          <View style={container.modal}>
            <View style={container.modalContent}>
              <Text style={text.modal}>{errorMessage}</Text>
              <TouchableOpacity onPress={() => setIsErrorVisible(false)}>
                <ThemedText style={text.modal}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaProvider>
  );
}
