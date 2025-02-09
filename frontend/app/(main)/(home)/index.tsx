import React, { useState } from "react";
import { TextInput, TouchableOpacity, Alert, Modal, View, Text, Image } from "react-native"; // Added Image
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { general, button, image, container, text } from "../styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // Importing Ionicons for the toggle icon
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
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
        // Save the session flag in AsyncStorage (Optional for session validation)
        await AsyncStorage.setItem("isLoggedIn", "true");

        Alert.alert("Success", data.message);
        // Navigate to the Matching page
        router.push("/matching"); 
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
              style={image.logo} // Add a style for the image
              resizeMode="contain" // Ensure the image fits well
            />
          </View>

          {/* Login Title */}
          <Text style={text.title}>Login</Text>

          {/* Username Input */}
          <TextInput
            style={container.input}
            placeholder="Username"
            value={email} // Use username as email
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <View style={container.password}>
            <TextInput
              style={container.input} // Ensure the input is styled similarly to username input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible} // Toggle password visibility
            />
            {/* Toggle visibility button */}
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)} // Toggle visibility
              style={button.toggle}
            >
              <Ionicons
                name={passwordVisible ? "eye-off" : "eye"} // Toggle icon for visibility
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
          <Text style={[text.footer, text.link]}>
            Do not have an account?{" "}
            <Text
              onPress={() => router.push("/accountSelection")} // Navigate to account selection page
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
