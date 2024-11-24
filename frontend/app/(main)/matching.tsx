import React, { useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { styles } from "./styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Image, TouchableOpacity, FlatList } from "react-native";

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

  useEffect(() => {
    // Fetch properties from the backend using fetch API
    fetch("/api/properties")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setProperties(data.properties);
        } else {
          console.error("Failed to fetch properties:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching properties:", error);
      });
  }, []);

  const swiped = (direction: string, propertyId: number) => {
    setLastDirection(direction);
    if (direction === "right") {
      console.log("Matched property with ID:", propertyId);
      // Handle matched property (e.g., update in DB or state)
    }
  };

  const outOfFrame = (id: number) => {
    console.log("Property removed from frame with ID:", id);
  };

  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          <ThemedText type="title">Matching App</ThemedText>

          {/* Property List */}
          {properties.length > 0 ? (
            <FlatList
              data={properties}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.propertyCard}>
                  <Image
                    source={{ uri: "https://via.placeholder.com/400x300" }} // Replace with dynamic image URL
                    style={styles.propertyImage}
                  />
                  <View style={styles.propertyDetails}>
                    <Text style={styles.propertyText}>
                      Property ID: {item.id}
                    </Text>
                    <Text style={styles.propertyText}>
                      Size: {item.size_sqft} sqft
                    </Text>
                    <Text style={styles.propertyText}>Price: ${item.price}</Text>
                    <Text style={styles.propertyText}>
                      Beds: {item.bedrooms} bed
                    </Text>
                    <Text style={styles.propertyText}>
                      Baths: {item.bathrooms} bath
                    </Text>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text>No properties available</Text>
          )}

          {/* Swipe Actions */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.swipeLeft}
              onPress={() => swiped("left", 0)} // Example ID
            >
              <Text style={styles.buttonText}>❌ Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.swipeRight}
              onPress={() => swiped("right", 0)} // Example ID
            >
              <Text style={styles.buttonText}>✔️ Match</Text>
            </TouchableOpacity>
          </View>

          {/* Debug Last Swipe Direction */}
          {lastDirection ? (
            <Text style={styles.footerText}>
              Last Swipe: {lastDirection}
            </Text>
          ) : null}
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
