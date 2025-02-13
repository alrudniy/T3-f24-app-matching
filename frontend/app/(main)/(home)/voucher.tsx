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
import { useLocalSearchParams, useRouter, useSegments } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // For icons
import { general, button, image, container, text } from "../styles";

export default function VoucherView() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const router = useRouter();
  const segments = useSegments();

  const [form, setForm] = useState({
    expireDate: "",
    priceLimit: "",
    housingType: "",
    familyMembers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const expireRegex = /^[0-9]{8}$/; // Example format: YYYYMMDD
  const priceRegex = /^[0-9]+$/; // Allow numeric values only

  const handleChange = (name: string, value: string | number) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const { expireDate, priceLimit, housingType, familyMembers } = form;

    console.log("Form State at Submit:", form); // Debugging log to confirm field values

    // Validate missing fields
    if (!expireDate || !priceLimit || !housingType || familyMembers <= 0) {
      const missingFields = [];
      if (!expireDate) missingFields.push("Expire Date");
      if (!priceLimit) missingFields.push("Price Limit");
      if (!housingType) missingFields.push("Housing Type");
      if (familyMembers <= 0) missingFields.push("Family Members");
      setErrorMessage(`Missing fields: ${missingFields.join(", ")}`);
      setErrorModalVisible(true);
      return;
    }

    // Validate format for Expiration Date and Price Limit
    if (!expireRegex.test(expireDate)) {
      setErrorMessage("Please enter a valid expiration date in YYYYMMDD format.");
      setErrorModalVisible(true);
      return;
    }

    if (!priceRegex.test(priceLimit)) {
      setErrorMessage("Please enter a valid price limit (numeric values only).");
      setErrorModalVisible(true);
      return;
    }

    // Set loading state
    setLoading(true);

    try {
      // Send POST request to Flask backend with voucher data, include credentials for session handling
      const response = await fetch("http://localhost:5000/api/voucher/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any necessary headers here (if needed)
        },
        body: JSON.stringify({
          expiration_date: expireDate,
          price_limit: priceLimit,
          housing_type: housingType,
          family_members: familyMembers,
        }),
        credentials: "include",  // Ensure the session cookie is sent with the request
      });

      const data = await response.json();

      if (data.success) {
        // On success, navigate to the matching screen or show a success message
        router.push("/matching"); // Navigate to the matching page or adjust as needed
      } else {
        setErrorMessage(data.message || "Voucher creation failed.");
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error("Error during voucher creation:", error);
      setErrorMessage("An error occurred. Please try again.");
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      {/* Header */}
      <View style={container.loggedInHeader}>
        <TouchableOpacity onPress={() => router.push("/profile")} style={image.loggedInHeaderIcon}>
          <Ionicons name="person-circle-outline" size={40} color="#333" />
        </TouchableOpacity>

        <Image
          source={require("./assets/images/icon_logo.png")}
          style={image.loggedInLogo}
          resizeMode="contain"
        />

        <TouchableOpacity onPress={() => router.push("/voucher")} style={image.loggedInHeaderIcon}>
          <Ionicons name="newspaper-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ThemedView style={container.base}>
        <SafeAreaView style={[container.inner, { flex: 1 }]}>
          <ScrollView
            contentContainerStyle={{
              paddingVertical: 20,
              alignItems: "center",
            }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Input Voucher</Text>

            <View style={container.form}>
              <TextInput
                placeholder="Expiration Date (YYYYMMDD)"
                style={container.input}
                value={form.expireDate}
                onChangeText={(text) => handleChange("expireDate", text)}
                keyboardType="number-pad"
              />

              <TextInput
                placeholder="Price Limit"
                style={container.input}
                value={form.priceLimit}
                onChangeText={(text) => handleChange("priceLimit", text)}
                keyboardType="number-pad"
              />

              {/* Dropdown for Housing Type */}
              <View style={container.dropdown}>
                <Text style={text.dropdown}>Housing Type:</Text>
                <Picker
                  selectedValue={form.housingType}
                  onValueChange={(itemValue) =>
                    handleChange("housingType", itemValue)
                  }
                  style={{ flex: 1, marginLeft: 10 }}
                >
                  <Picker.Item label="Select Housing Type" value="" />
                  <Picker.Item label="Apartment" value="apartment" />
                  <Picker.Item label="House" value="house" />
                  <Picker.Item label="Shelter" value="shelter" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>

              {/* Family Members Section */}
              <View style={container.familyMembers}>
                <Text style={text.familyMembersLabel}>Family Members:</Text>
                <View style={container.familyButtons}>
                  <TouchableOpacity
                    style={button.family}
                    onPress={() =>
                      handleChange(
                        "familyMembers",
                        Math.max(form.familyMembers - 1, 0)
                      )
                    }
                  >
                    <Text style={button.familyText}>-</Text>
                  </TouchableOpacity>
                  <Text>{form.familyMembers}</Text>
                  <TouchableOpacity
                    style={button.family}
                    onPress={() =>
                      handleChange("familyMembers", form.familyMembers + 1)
                    }
                  >
                    <Text style={button.familyText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Button title="Submit Voucher" onPress={handleSubmit} color="#4CAF50" />
            </View>
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
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
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

      {/* Bottom Navigation */}
      <View style={container.navBar}>
        <TouchableOpacity
          style={[container.navBarItem, segments[0] === "matching" && container.activeNavBarItem]}
          onPress={() => router.push("/matching")}
        >
          <Ionicons
            name="compass-outline"
            size={24}
            color={segments[0] === "matching" ? "#007BFF" : "#666"}
          />
          <Text style={[text.navBar, segments[0] === "matching" && text.activeNavBar]}>
            Explore
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[container.navBarItem, segments[0] === "matchingHistory" && container.activeNavBarItem]}
          onPress={() => router.push("/matchingHistory")}
        >
          <Ionicons
            name="heart-outline"
            size={24}
            color={segments[0] === "matchingHistory" ? "#007BFF" : "#666"}
          />
          <Text
            style={[text.navBar, segments[0] === "matchingHistory" && text.activeNavBar]}
          >
            Matches
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}
