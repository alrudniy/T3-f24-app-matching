import React, { useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { styles } from "./styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Image, TouchableOpacity, FlatList, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage for token storage

interface Property {
  id: number;
  size_sqft: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  user_id: number;
}

export default function MatchingView() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [lastDirection, setLastDirection] = useState<string>("");

  // Retrieve token and fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken"); // Replace with your token key

        if (!token) {
          Alert.alert("Error", "User not authenticated. Please log in.");
          return;
        }

        const response = await fetch("/api/properties", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add the Bearer token
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setProperties(data.properties);
        } else {
          console.error("Failed to fetch properties:", data.message);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, []);

  // Match property logic
  const tagAsMatch = async (propertyId: number) => {
    try {
      const token = await AsyncStorage.getItem("authToken"); // Replace with your token key

      if (!token) {
        Alert.alert("Error", "User not authenticated. Please log in.");
        return;
      }

      const response = await fetch(`/api/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add the Bearer token
        },
        body: JSON.stringify({ property_id: propertyId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProperties((prev) => prev.filter((property) => property.id !== propertyId));
        Alert.alert("Matched!", "You have matched this property.");
      } else {
        console.error("Failed to tag property as a match:", data.message);
      }
    } catch (error) {
      console.error("Error tagging property as a match:", error);
    }
  };

  // Handle swipe actions
  const swiped = (direction: string, propertyId: number) => {
    setLastDirection(direction);
    if (direction === "right") {
      tagAsMatch(propertyId);
    } else if (direction === "left") {
      console.log("Discarded property with ID:", propertyId);
    }
  };

  // Render function for properties
  const renderProperty = ({ item }: { item: Property }) => (
    <View style={styles.propertyCard}>
      <Image
        source={{ uri: "https://via.placeholder.com/400x300" }} // Replace with actual image URLs
        style={styles.propertyImage}
      />
      <View style={styles.propertyDetails}>
        <Text style={styles.propertyText}>Property ID: {item.id}</Text>
        <Text style={styles.propertyText}>Size: {item.size_sqft} sqft</Text>
        <Text style={styles.propertyText}>Price: ${item.price}</Text>
        <Text style={styles.propertyText}>Beds: {item.bedrooms} bed</Text>
        <Text style={styles.propertyText}>Baths: {item.bathrooms} bath</Text>
      </View>
      <TouchableOpacity
        style={styles.swipeRight}
        onPress={() => tagAsMatch(item.id)}
      >
        <Text style={styles.buttonText}>✔️ Match</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          <ThemedText type="title">Matching App</ThemedText>

          {properties.length > 0 ? (
            <FlatList
              data={properties}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderProperty}
            />
          ) : (
            <Text>No properties available</Text>
          )}

          {/* Swipe Actions */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.swipeLeft}
              onPress={() => {
                if (properties.length > 0) swiped("left", properties[0].id);
              }}
            >
              <Text style={styles.buttonText}>❌ Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.swipeRight}
              onPress={() => {
                if (properties.length > 0) swiped("right", properties[0].id);
              }}
            >
              <Text style={styles.buttonText}>✔️ Match</Text>
            </TouchableOpacity>
          </View>

          {lastDirection ? (
            <Text style={styles.footerText}>Last Swipe: {lastDirection}</Text>
          ) : null}
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
