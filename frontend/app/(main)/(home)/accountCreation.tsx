import React, { useState } from "react";
import { Alert, ScrollView, TextInput, Button, Modal, View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles";

export default function AccountCreationView() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const router = useRouter();

  // State variables for form data and UI
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Function to handle form input changes
  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  // Function to submit form data
  const handleSubmit = async () => {
    const { firstName, lastName, email, confirmEmail, password, confirmPassword } = form;

    // Validate form fields
    if (!firstName || !lastName || !email || !confirmEmail || !password || !confirmPassword) {
      setErrorMessage("All fields are required.");
      setErrorModalVisible(true);
      return;
    }

    if (email !== confirmEmail) {
      setErrorMessage("Email and Confirm Email must match.");
      setErrorModalVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password and Confirm Password must match.");
      setErrorModalVisible(true);
      return;
    }

    // Validate role
    if (role !== "tenant" && role !== "landlord") {
      setErrorMessage("Invalid role. Please select a valid role.");
      setErrorModalVisible(true);
      return;
    }

    setLoading(true);

    // Make a POST request to the Flask backend
    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password,
          firstName,
          lastName,
          role, // Send the role to the backend
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to the next screen on success
        router.push("/matching");
      } else {
        // Show error message on failure
        setErrorMessage(data.message || "Registration failed.");
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage("An error occurred. Please try again.");
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.innerContainer, { flex: 1 }]}>
          <ScrollView
            contentContainerStyle={{
              paddingVertical: 20,
              alignItems: "center",
            }}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText type="title" style={{ marginBottom: 20 }}>
              Create Account
            </ThemedText>

            <ThemedText style={{ marginBottom: 20 }}>
              Role: {role || "Not Selected"}
            </ThemedText>

            <ThemedView style={styles.formContainer}>
              <TextInput
                placeholder="First Name"
                style={styles.input}
                value={form.firstName}
                onChangeText={(text) => handleChange("firstName", text)}
              />
              <TextInput
                placeholder="Last Name"
                style={styles.input}
                value={form.lastName}
                onChangeText={(text) => handleChange("lastName", text)}
              />
              <TextInput
                placeholder="Email"
                style={styles.input}
                value={form.email}
                onChangeText={(text) => handleChange("email", text)}
                keyboardType="email-address"
              />
              <TextInput
                placeholder="Confirm Email"
                style={styles.input}
                value={form.confirmEmail}
                onChangeText={(text) => handleChange("confirmEmail", text)}
                keyboardType="email-address"
              />
              <TextInput
                placeholder="Password"
                secureTextEntry
                style={styles.input}
                value={form.password}
                onChangeText={(text) => handleChange("password", text)}
              />
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                style={styles.input}
                value={form.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
              />
              <Button title="Create Account" onPress={handleSubmit} color="#4CAF50" />
            </ThemedView>
          </ScrollView>

          {loading && (
            <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
          )}
        </SafeAreaView>

        {/* Error Modal */}
        <Modal
          visible={errorModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setErrorModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <View style={{ width: "80%", backgroundColor: "white", borderRadius: 10, padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Error</Text>
              <Text style={{ marginBottom: 20 }}>{errorMessage}</Text>
              <Button title="Close" onPress={() => setErrorModalVisible(false)} color="#FF3B30" />
            </View>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaProvider>
  );
}
