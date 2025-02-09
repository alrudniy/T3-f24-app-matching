import React, { useState } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { general, button, image, container, text } from "./styles";

export default function PropertyCreation() {
  const [form, setForm] = useState({
    name: "",
    street: "",
    city: "",
    size: "",
    value: "",
    bedrooms: "",
    bathrooms: "",
    userId: "1", // Default to a specific user ID (e.g., hardcoded for testing)
  });
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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
        setImages((prev) => [...prev, { uri, name: filename, type }]); // Add image to the state
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("An error occurred while selecting the image.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("street_address", form.street);
      formData.append("city", form.city);
      formData.append("size_sqft", form.size);
      formData.append("price", form.value);
      formData.append("bedrooms", form.bedrooms);
      formData.append("bathrooms", form.bathrooms);
      formData.append("user_id", form.userId); // Explicitly include user ID

      images.forEach((image) => {
        formData.append("images", {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);
      });

      const response = await fetch("http://127.0.0.1:5000/property/create", {
        method: "POST",
        body: formData,
        credentials: "include", // Include session cookies
    });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("Success", "Property created successfully!");
        router.push("/matching");
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

      {/* Content */}
      <SafeAreaView style={container.base}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={text.sectionHeader}>General Information</Text>
          <TextInput
            placeholder="Name"
            style={container.input}
            value={form.name}
            onChangeText={(text) => handleInputChange("name", text)}
          />
          <TextInput
            placeholder="Property Address"
            style={container.input}
            value={form.street}
            onChangeText={(text) => handleInputChange("street", text)}
          />
          <TextInput
            placeholder="City"
            style={container.input}
            value={form.city}
            onChangeText={(text) => handleInputChange("city", text)}
          />

          <Text style={text.sectionHeader}>Details</Text>
          <View style={container.row}>
            <TextInput
              placeholder="Size"
              style={[container.input, general.halfWidth]}
              value={form.size}
              onChangeText={(text) => handleInputChange("size", text)}
            />
            <TextInput
              placeholder="Value"
              style={[container.input, general.halfWidth]}
              value={form.value}
              onChangeText={(text) => handleInputChange("value", text)}
            />
          </View>

          <Text style={text.sectionHeader}>Rooms</Text>
          <View style={container.row}>
            <TextInput
              placeholder="Bedrooms"
              style={[container.input, general.halfWidth]}
              value={form.bedrooms}
              onChangeText={(text) => handleInputChange("bedrooms", text)}
            />
            <TextInput
              placeholder="Bathrooms"
              style={[container.input, general.halfWidth]}
              value={form.bathrooms}
              onChangeText={(text) => handleInputChange("bathrooms", text)}
            />
          </View>

          <Text style={text.sectionHeader}>Upload Images</Text>
          <TouchableOpacity style={button.imageUpload} onPress={handleImageUpload}>
            <Text style={button.imageUploadText}>Select Images</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View style={container.preview}>
              {images.map((image, index) => (
                <Image key={index} source={{ uri: image.uri }} style={image.previewImage} />
              ))}
            </View>
          )}

          <Button title="Submit" onPress={handleSubmit} color="#4CAF50" />
        </ScrollView>

        {loading && <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />}
      </SafeAreaView>

      {/* Bottom Navigation */}
      <View style={container.navBar}>
        <TouchableOpacity onPress={() => router.push("/matching")} style={container.navBarItem}>
          <Ionicons name="search-outline" size={24} color="#4CAF50" />
          <Text style={text.navBar}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/matchingHistory")} style={container.navBarItem}>
          <Ionicons name="heart-outline" size={24} color="#333" />
          <Text style={text.navBar}>Matches</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}
