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
import { modal_error, button, image, container, text } from "../styles";
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
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
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
      <View style={container.base}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.push("/accountSelection")} // Navigate back to the home page ("/")
          style={{
            position: "absolute",
            top: 120, // Adjust the top position to place the button properly
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

        <View style={container.header}>
          <Image
            source={require("./assets/images/logo.png")}
            style={image.logo}
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
          <Text style={text.title}>Create Account</Text>
          <Text style={text.subtitle}>Role: {role || "Not Selected"}</Text>
          <View style={container.form}>
            <TextInput
              placeholder="Username"
              style={container.input}
              value={form.username}
              onChangeText={(text) => handleChange("username", text)}
            />
            {role === "landlord" && (
              <TextInput
                placeholder="Business Name"
                style={container.input}
                value={form.businessName}
                onChangeText={(text) => handleChange("businessName", text)}
              />
            )}
            <TextInput
              placeholder="First Name"
              style={container.input}
              value={form.firstName}
              onChangeText={(text) => handleChange("firstName", text)}
            />
            <TextInput
              placeholder="Last Name"
              style={container.input}
              value={form.lastName}
              onChangeText={(text) => handleChange("lastName", text)}
            />
            <TextInput
              placeholder="Email"
              style={container.input}
              value={form.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Confirm Email"
              style={container.input}
              value={form.confirmEmail}
              onChangeText={(text) => handleChange("confirmEmail", text)}
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Phone Number"
              style={container.input}
              value={form.phone}
              onChangeText={(text) => handleChange("phone", text)}
              keyboardType="phone-pad"
            />
            <View style={container.password}>
              <TextInput
                placeholder="Password"
                style={container.input}
                value={form.password}
                onChangeText={(text) => handleChange("password", text)}
                secureTextEntry={!passwordVisible}
              />
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
            <View style={container.password}>
              <TextInput
                placeholder="Confirm Password"
                style={container.input}
                value={form.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                secureTextEntry={!confirmPasswordVisible}
              />
              <TouchableOpacity
                onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                style={button.toggle}
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

        {/* Error Modal */}
        <Modal
          visible={errorModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setErrorModalVisible(false)}
        >
          <View style={modal_error.modalBackground}>
            <View style={modal_error.modalContainer}>
              <Text style={modal_error.modalTitle}>Error</Text>
              <Text style={modal_error.modalMessage}>{errorMessage}</Text>
              <Button
                title="Close"
                onPress={() => setErrorModalVisible(false)}
                color="#FF0000"
              />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaProvider>
  );
}
