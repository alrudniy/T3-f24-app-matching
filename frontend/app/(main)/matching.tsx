import React, { useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { styles } from "./styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Image, TouchableOpacity, FlatList, Alert } from "react-native";

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
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/properties", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            //Authorization: `Bearer ${yourAuthToken}`, // Replace with actual token retrieval logic
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

  const tagAsMatch = async (propertyId: number) => {
    try {
      const response = await fetch(`/api/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //Authorization: `Bearer ${yourAuthToken}`, // Replace with actual token retrieval logic
        },
        body: JSON.stringify({ property_id: propertyId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove matched property from list
        setProperties((prev) => prev.filter((property) => property.id !== propertyId));
        Alert.alert("Matched!", "You have matched this property.");
        console.log(`Property ID ${propertyId} tagged as a match.`);
      } else {
        console.error("Failed to tag property as a match:", data.message);
      }
    } catch (error) {
      console.error("Error tagging property as a match:", error);
    }
  };

  const swiped = (direction: string, propertyId: number) => {
    setLastDirection(direction);
    if (direction === "right") {
      console.log("Matched property with ID:", propertyId);
      tagAsMatch(propertyId);
    } else if (direction === "left") {
      console.log("Discarded property with ID:", propertyId);
      // Optional: Add discard logic if necessary
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
              )}
            />
          ) : (
            <Text>No properties available</Text>
          )}

          {/* Swipe Actions */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.swipeLeft}
              onPress={() => swiped("left", 0)} // Placeholder ID for discard action
            >
              <Text style={styles.buttonText}>❌ Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.swipeRight}
              onPress={() => {
                if (properties.length > 0) {
                  tagAsMatch(properties[0].id); // Match the first property
                }
              }}
            >
              <Text style={styles.buttonText}>✔️ Match</Text>
            </TouchableOpacity>
          </View>

          {/* Debug Last Swipe Direction */}
          {lastDirection ? (
            <Text style={styles.footerText}>Last Swipe: {lastDirection}</Text>
          ) : null}
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
