import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  TextInput,
  Button,
  Modal,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles";

export default function AccountCreationView() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    phone: "", 
  });
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Regular expressions for validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const {
      firstName,
      lastName,
      email,
      confirmEmail,
      password,
      confirmPassword,
      phone,
    } = form;

    // Validate form fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !confirmEmail ||
      !password ||
      !confirmPassword ||
      !phone
    ) {
      setErrorMessage("All fields are required.");
      setErrorModalVisible(true);
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      setErrorModalVisible(true);
      return;
    }

    if (!phoneRegex.test(phone)) {
      setErrorMessage(
        "Please enter a valid phone number (10 digits, no spaces or special characters)."
      );
      setErrorModalVisible(true);
      return;
    }

    if (email !== confirmEmail) {
      setErrorMessage("Emails must match.");
      setErrorModalVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords must match.");
      setErrorModalVisible(true);
      return;
    }

    if (role !== "tenant" && role !== "landlord") {
      setErrorMessage("Invalid role. Please select a valid role.");
      setErrorModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password,
          firstName,
          lastName,
          role,
          phone, // Include the phone number in the payload
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/matching");
      } else {
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
                placeholder="Phone Number"
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => handleChange("phone", text)}
                keyboardType="phone-pad"
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
              <Button
                title="Create Account"
                onPress={handleSubmit}
                color="#4CAF50"
              />
            </ThemedView>
          </ScrollView>

          {loading && (
            <ActivityIndicator
              size="large"
              color="#4CAF50"
              style={{ marginTop: 20 }}
            />
          )}
        </SafeAreaView>

        <Modal
          visible={errorModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setErrorModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <View
              style={{
                width: "80%",
                backgroundColor: "white",
                borderRadius: 10,
                padding: 20,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
              >
                Error
              </Text>
              <Text style={{ marginBottom: 20 }}>{errorMessage}</Text>
              <Button
                title="Close"
                onPress={() => setErrorModalVisible(false)}
                color="#FF3B30"
              />
            </View>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaProvider>
  );
}
