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
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useSegments } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { general, button, image, container, text } from "./styles";

interface CurrentUser {
  id: number;
  username: string;
  email?: string;
}

interface Accessibility {
  id: number;
  type: string;
}

// Define an interface for the image file objects.
interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

export default function PropertyCreation() {
  const router = useRouter();
  const segments = useSegments();

  // Current User
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Form Data (including "description")
  const [form, setForm] = useState({
    name: "",
    street: "",
    city: "",
    description: "",
    size: "",
    value: "",
    bedrooms: "",
    bathrooms: "",
  });

  // Images – store each selected image as an ImageFile.
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);

  // Accessibilities
  const [accessibilities, setAccessibilities] = useState<Accessibility[]>([]);
  const [selectedAccessibilities, setSelectedAccessibilities] = useState<number[]>([]);

  useEffect(() => {
    fetchCurrentUser();
    fetchAccessibilities();
  }, []);

  // 1) Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/current-user", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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

  // 2) Fetch accessibilities
  const fetchAccessibilities = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/accessibilities", {
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

  // Handle form inputs
  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Image Picker: select image and generate a valid filename.
  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const picked = result.assets[0];
        console.log("Picked image:", picked.uri);
        // Generate a valid filename using timestamp.
        const timestamp = Date.now();
        const filename = `property_image_${timestamp}.jpg`;
        const type = "image/jpeg"; // Force JPEG
        setImages((prev) => [
          ...prev,
          { uri: picked.uri, name: filename, type },
        ]);
      }
    } catch (error) {
      console.error("Image upload error:", error);
      Alert.alert("Error", "An error occurred while selecting the image.");
    }
  };

  const handleToggleAccessibility = (id: number) => {
    setSelectedAccessibilities((prev) =>
      prev.includes(id) ? prev.filter((accId) => accId !== id) : [...prev, id]
    );
  };

  // Step One: Create property (without images)
  const createProperty = async (): Promise<number | null> => {
    try {
      if (!currentUser?.id) {
        Alert.alert("Error", "No user ID found. Please log in.");
        return null;
      }
      setLoading(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("street_address", form.street);
      formData.append("city", form.city);
      formData.append("description", form.description);
      formData.append("size_sqft", form.size);
      formData.append("price", form.value);
      formData.append("bedrooms", form.bedrooms);
      formData.append("bathrooms", form.bathrooms);
      formData.append("user_id", String(currentUser.id));

      const response = await fetch("http://localhost:5000/property/create", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        Alert.alert("Error", data.message || "Property creation failed.");
        return null;
      }
      console.log("Property created with ID:", data.property_id);
      return data.property_id;
    } catch (error) {
      console.error("Error creating property:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Step Two: Upload images using blob conversion.
  const uploadImages = async (propertyId: number) => {
    try {
      if (images.length === 0) {
        console.log("No images to upload.");
        return;
      }
      console.log("Uploading images:", images.length);
      const formData = new FormData();
      for (let i = 0; i < images.length; i++) {
        const { uri, name } = images[i];
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append("images", blob, name);
        } catch (err) {
          console.error("Error converting image to blob:", err);
        }
      }
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/property/${propertyId}/upload-images`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: { Accept: "application/json" },
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        Alert.alert("Warning", data.message || "Images upload failed.");
      } else {
        console.log("Images uploaded successfully:", data.images);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      Alert.alert("Warning", "Property created, but images upload failed.");
    } finally {
      setLoading(false);
    }
  };

  // Step Three: Add Accessibilities
  const addAccessibilities = async (propertyId: number) => {
    try {
      if (selectedAccessibilities.length === 0) return;
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/property/${propertyId}/add-accessibility`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ accessibility_ids: selectedAccessibilities }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        Alert.alert(
          "Warning",
          data.message || "Property created, but adding accessibilities failed."
        );
      } else {
        console.log("Accessibilities added:", selectedAccessibilities);
      }
    } catch (error) {
      console.error("Error adding accessibilities:", error);
      Alert.alert("Warning", "Property created, but adding accessibilities failed.");
    } finally {
      setLoading(false);
    }
  };

  // Combined flow: create property, then upload images, then add accessibilities.
  const handleSubmit = async () => {
    const propertyId = await createProperty();
    if (!propertyId) return;
    await uploadImages(propertyId);
    await addAccessibilities(propertyId);
    Alert.alert("Success", "Property created successfully!");
    router.push("/(main)/properties");
  };

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
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
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

          {/* Description Input */}
          <TextInput
            placeholder="Description"
            style={[container.input, styles.multilineInput]}
            value={form.description}
            onChangeText={(txt) => handleInputChange("description", txt)}
            multiline
            numberOfLines={4}
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
              placeholder="Price"
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
                  color={selectedAccessibilities.includes(acc.id) ? "#4CAF50" : "#666"}
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

          {/* Preview Selected Images */}
          {images.length > 0 && (
            <FlatList
              data={images}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }: { item: ImageFile }) => (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: item.uri }} style={styles.image} />
                </View>
              )}
            />
          )}

          {/* Submit */}
          <Button title="Submit" onPress={handleSubmit} color="#4CAF50" />

          {loading && (
            <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={container.navBar}>
          <TouchableOpacity
            style={[container.navBarItem, segments[1] === "properties" && container.activeNavBarItem]}
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
            style={[container.navBarItem, segments[0] === "landlordMatchingHistory" && container.activeNavBarItem]}
            onPress={() => router.push("/(main)/landlordMatchingHistory")}
          >
            <Ionicons
              name="heart-outline"
              size={24}
              color={segments[0] === "landlordMatchingHistory" ? "#007BFF" : "#666"}
            />
            <Text style={[text.navBar, segments[0] === "landlordMatchingHistory" && text.activeNavBar]}>
              Matches
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}



const styles = StyleSheet.create({
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
    padding: 10,
  },
  accessibilityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "45%",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    flexShrink: 1,
  },
  imagePreview: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
});
