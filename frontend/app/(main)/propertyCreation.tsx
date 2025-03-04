import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useSegments } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { general, button, image, container, text } from "./styles";

// ------------------------------
// Interfaces
// ------------------------------

// For the current user
interface CurrentUser {
  id: number;
  username: string;
  email?: string;
  // ... any other fields
}

// For accessibilities
interface Accessibility {
  id: number;
  type: string;
}

// ------------------------------
// Component
// ------------------------------
export default function PropertyCreation() {
  const router = useRouter();
  const segments = useSegments();

  // ------------------------------
  // State for Current User
  // ------------------------------
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // ------------------------------
  // Property Form State
  // ------------------------------
  const [form, setForm] = useState({
    name: "",
    street: "",
    city: "",
    size: "",
    value: "",
    bedrooms: "",
    bathrooms: "",
  });

  // ------------------------------
  // Images
  // ------------------------------
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ------------------------------
  // Accessibilities
  // ------------------------------
  const [accessibilities, setAccessibilities] = useState<Accessibility[]>([]);
  const [selectedAccessibilities, setSelectedAccessibilities] = useState<number[]>([]);

  // ------------------------------
  // useEffects
  // ------------------------------
  useEffect(() => {
    // 1) Fetch the current user
    fetchCurrentUser();
    // 2) Fetch accessibilities
    fetchAccessibilities();
  }, []);

  // ------------------------------
  // 1. Fetch Current User
  // ------------------------------
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/current-user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
      } else {
        Alert.alert("Error", data.message || "Failed to load user data.");
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      Alert.alert("Error", "Could not load user. Please try again.");
    }
  };

  // ------------------------------
  // 2. Fetch Accessibilities
  // ------------------------------
  const fetchAccessibilities = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/accessibilities", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setAccessibilities(data.accessibilities);
      } else {
        console.error("Failed to fetch accessibilities:", data.message);
      }
    } catch (error) {
      console.error("Error fetching accessibilities:", error);
    }
  };

  // ------------------------------
  // Handle Form Input
  // ------------------------------
  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ------------------------------
  // Image Upload
  // ------------------------------
  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const filename = uri.split("/").pop(); // Extract filename
        const type = `image/${uri.split(".").pop()}`; // Extract MIME type
        setImages((prev) => [...prev, { uri, name: filename, type }]);
      }
    } catch (error) {
      console.error("Image upload error:", error);
      Alert.alert("Error", "An error occurred while selecting the image.");
    }
  };

  // ------------------------------
  // Toggle Accessibility
  // ------------------------------
  const handleToggleAccessibility = (id: number) => {
    setSelectedAccessibilities((prev) =>
      prev.includes(id) ? prev.filter((accId) => accId !== id) : [...prev, id]
    );
  };

  // ------------------------------
  // Submit Property
  // ------------------------------
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1) Make sure user is loaded
      if (!currentUser?.id) {
        Alert.alert("Error", "No user ID found. Please log in.");
        return;
      }

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("street_address", form.street);
      formData.append("city", form.city);
      formData.append("size_sqft", form.size);
      formData.append("price", form.value);
      formData.append("bedrooms", form.bedrooms);
      formData.append("bathrooms", form.bathrooms);

      // 2) Use currentUser.id
      formData.append("user_id", String(currentUser.id));

      // Accessibilities
      selectedAccessibilities.forEach((id) => {
        formData.append("accessibilities", id.toString());
      });

      // Images
      images.forEach((image) => {
        formData.append("images", {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);
      });
      // 3) Send the request to create the property
      const response = await fetch("http://127.0.0.1:5000/property/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("Success", "Property created successfully!");
        router.push("/(main)/properties");
      } else {
        Alert.alert("Error", data.message || "Property creation failed.");
      }
    } catch (error) {
      console.error("Error during property creation:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <SafeAreaProvider>
      {/* Header */}
      <View style={container.loggedInHeader}>
        <TouchableOpacity onPress={() => router.push("/profile")} style={image.loggedInHeaderIcon}>
          <Ionicons name="person-circle-outline" size={40} color="#333" />
        </TouchableOpacity>

        <Image
          source={require("./(home)/assets/images/icon_logo.png")}
          style={image.loggedInLogo}
          resizeMode="contain"
        />

        <TouchableOpacity onPress={() => router.push("/voucher")} style={image.loggedInHeaderIcon}>
          <Ionicons name="newspaper-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      <SafeAreaView style={container.base}>
        <ScrollView contentContainerStyle={{
        padding: 20,
        paddingBottom: 100,
      }}>
          
          <Text style={text.title}>Add a Property</Text>

          {/* General Information */}
          <Text style={text.sectionHeader}>General Information</Text>
          <TextInput
            placeholder="Name"
            style={container.input}
            value={form.name}
            onChangeText={(txt) => handleInputChange("name", txt)}
          />
          <TextInput
            placeholder="Property Address"
            style={container.input}
            value={form.street}
            onChangeText={(txt) => handleInputChange("street", txt)}
          />
          <TextInput
            placeholder="City"
            style={container.input}
            value={form.city}
            onChangeText={(txt) => handleInputChange("city", txt)}
          />

          {/* Property Details */}
          <Text style={text.sectionHeader}>Details</Text>
          <View style={container.row}>
            <TextInput
              placeholder="Size"
              style={[container.input, general.halfWidth]}
              value={form.size}
              onChangeText={(txt) => handleInputChange("size", txt)}
            />
            <TextInput
              placeholder="Value"
              style={[container.input, general.halfWidth]}
              value={form.value}
              onChangeText={(txt) => handleInputChange("value", txt)}
            />
          </View>

          {/* Rooms Section */}
          <Text style={text.sectionHeader}>Rooms</Text>
          <View style={container.row}>
            <TextInput
              placeholder="Bedrooms"
              style={[container.input, general.halfWidth]}
              value={form.bedrooms}
              onChangeText={(txt) => handleInputChange("bedrooms", txt)}
            />
            <TextInput
              placeholder="Bathrooms"
              style={[container.input, general.halfWidth]}
              value={form.bathrooms}
              onChangeText={(txt) => handleInputChange("bathrooms", txt)}
            />
          </View>

          {/* Accessibility Section */}
          <Text style={text.sectionHeader}>Accessibilities</Text>
          <View style={styles.accessibilityContainer}>
            {accessibilities.map((acc) => (
              <TouchableOpacity
                key={`accessibility-${acc.id}`}
                style={styles.checkboxRow}
                onPress={() => handleToggleAccessibility(acc.id)}
              >
                <Ionicons
                  name={
                    selectedAccessibilities.includes(acc.id)
                      ? "checkbox-outline"
                      : "square-outline"
                  }
                  size={24}
                  color={
                    selectedAccessibilities.includes(acc.id) ? "#4CAF50" : "#666"
                  }
                />
                <Text style={styles.checkboxLabel}>{acc.type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Image Upload */}
          <Text style={text.sectionHeader}>Upload Images</Text>
          <TouchableOpacity style={button.imageUpload} onPress={handleImageUpload}>
            <Text style={button.imageUploadText}>Select Images</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <Button title="Submit" onPress={handleSubmit} color="#4CAF50" />

          {loading && (
            <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20}} />
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={container.navBar}>
          <TouchableOpacity
            style={[
              container.navBarItem,
              segments[1] === "properties" && container.activeNavBarItem,
            ]}
            onPress={() => router.push("/(main)/properties")}
          >
            <Ionicons
              name="home"
              size={24}
              color={segments[1] === "properties" ? "#007BFF" : "#666"}
            />
            <Text style={text.navBar}>Properties</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              container.navBarItem,
              segments[0] === "landlordMatchingHistory" && container.activeNavBarItem,
            ]}
            onPress={() => router.push("/(main)/landlordMatchingHistory")}
          >
            <Ionicons
              name="heart-outline"
              size={24}
              color={segments[0] === "landlordMatchingHistory" ? "#007BFF" : "#666"}
            />
            <Text
              style={[text.navBar, segments[0] === "landlordMatchingHistory" && text.activeNavBar]}
            >
              Matches
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ------------------------------
// Local Styles
// ------------------------------
const styles = StyleSheet.create({
  accessibilityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "45%", // Ensures even layout
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    flexShrink: 1,
  },
});
