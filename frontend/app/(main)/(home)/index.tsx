import React, { useState } from "react";
import { TextInput, TouchableOpacity, Alert, Modal, View, Text } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link, useRouter } from "expo-router"; // Import useRouter for navigation
import { styles } from "../styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function HomeView() {
  const [email, setEmail] = useState(""); // You can keep email here as input but map it to username for login
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for the error message
  const [isErrorVisible, setIsErrorVisible] = useState(false); // State to control modal visibility
  const router = useRouter(); // Hook for navigation

  const handleLogin = async () => {
    if (email.trim() === "" || password.trim() === "") {
      setErrorMessage("Please enter both username and password");
      setIsErrorVisible(true); // Show the error modal
      return;
    }

    try {
      // Make sure you are sending 'username' instead of 'email'
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }), // Send username instead of email
      });

      const data = await response.json();

      // Check if the response is successful and the message is a success
      if (response.status === 200 && data.success) {
        Alert.alert("Success", data.message);
        // Navigate to a different page on successful login (example: Matching)
        router.push("/matching"); // You can replace this with the page you want to navigate to
      } else {
        // Show the error message in the modal
        setErrorMessage(data.message || "Invalid login credentials");
        setIsErrorVisible(true); // Show the error modal
      }
    } catch (error) {
      // Display a generic error message if an issue occurs
      setErrorMessage("An error occurred. Please try again later.");
      setIsErrorVisible(true); // Show the error modal
      console.error("Login error:", error);
    }
  };

  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          {/* Logo Placeholder */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>LOGO</Text>
            </View>
          </View>

          {/* Login Title */}
          <Text style={styles.title}>Login</Text>

          {/* Username Input */}
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={email} // Keep username as email, change label if necessary
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Login Button */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <ThemedText style={styles.buttonText}>Login</ThemedText>
          </TouchableOpacity>

          {/* Forgot Password and Create Account Links */}
          <Text style={styles.footerText}>Forgot your password?</Text>
          <Text style={[styles.footerText, styles.link]}>
            Do not have an account?{" "}
            <Text
              onPress={() => router.push("/accountSelection")} // Navigate to the registration page
              style={styles.link}
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
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{errorMessage}</Text>
              <TouchableOpacity onPress={() => setIsErrorVisible(false)}>
                <ThemedText style={styles.modalText}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaProvider>
  );
}
