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
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { styles } from "../styles";
import { Ionicons } from "@expo/vector-icons"; // Importing Ionicons for the toggle icon

export default function AccountCreationView() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false); // Toggle for password
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // Toggle for confirm password
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  const formatPhoneNumberInput = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return phone;

    const [, areaCode, prefix, lineNumber] = match;
    if (lineNumber) {
      return `(${areaCode}) ${prefix}-${lineNumber}`;
    } else if (prefix) {
      return `(${areaCode}) ${prefix}`;
    } else if (areaCode) {
      return `(${areaCode}`;
    }
    return "";
  };

  const handleChange = (name: string, value: string) => {
    if (name === "phone") {
      const formattedPhone = formatPhoneNumberInput(value);
      setForm({ ...form, [name]: formattedPhone });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    const {
      username,
      firstName,
      lastName,
      businessName,
      email,
      confirmEmail,
      password,
      confirmPassword,
      phone,
    } = form;

    if (
      !username ||
      !firstName ||
      !lastName ||
      !email ||
      !confirmEmail ||
      !password ||
      !confirmPassword ||
      !phone ||
      (role === "landlord" && !businessName)
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

    if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
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
          username,
          email,
          phone: phone.replace(/\D/g, ""),
          password,
          businessName: role === "landlord" ? businessName : null,
          firstName,
          lastName,
          role,
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("./assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <ScrollView
          contentContainerStyle={{
            marginTop: 100,
            paddingVertical: 20,
            alignItems: "center",
          }}
        >
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Role: {role || "Not Selected"}</Text>
          <View style={styles.formContainer}>
            <TextInput
              placeholder="Username"
              style={styles.input}
              value={form.username}
              onChangeText={(text) => handleChange("username", text)}
            />
            {role === "landlord" && (
              <TextInput
                placeholder="Business Name"
                style={styles.input}
                value={form.businessName}
                onChangeText={(text) => handleChange("businessName", text)}
              />
            )}
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
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                style={styles.input}
                value={form.password}
                onChangeText={(text) => handleChange("password", text)}
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.toggleButton}
              >
                <Ionicons
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirm Password"
                style={styles.input}
                value={form.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                secureTextEntry={!confirmPasswordVisible}
              />
              <TouchableOpacity
                onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                style={styles.toggleButton}
              >
                <Ionicons
                  name={confirmPasswordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            <Button
              title="Create Account"
              onPress={handleSubmit}
              color="#4CAF50"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaProvider>
  );
}
