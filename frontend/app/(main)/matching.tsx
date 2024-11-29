import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import Swiper from "react-native-deck-swiper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./styles"; // Importing the provided styles
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Property {
  id: number;
  size_sqft: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  pets_allowed: boolean;
  accessibility: string[];
  image_url: string;
}

export default function Matching() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [lastSwiped, setLastSwiped] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/properties", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();
      if (data.success) {
        setProperties(data.properties);
      } else {
        Alert.alert("Error", "Failed to fetch properties");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      Alert.alert("Error", "Could not load properties. Please try again.");
    }
  };

  const handleSwipeRight = async (propertyId: number) => {
    try {
      const response = await fetch("http://localhost:5000/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ property_id: propertyId }),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert("Success", "You liked this property!");
      } else {
        console.error("Error matching property:", result.message);
      }
    } catch (error) {
      console.error("Error matching property:", error);
      Alert.alert("Error", "Could not process your swipe. Please try again.");
    }
  };

  const handleSwipeLeft = (propertyId: number) => {
    console.log(`Property ${propertyId} discarded`);
    setLastSwiped("left");
  };

  const renderCard = (property: Property) => {
    return (
      <View style={styles.propertyCard}>
        <Image
          source={{ uri: property.image_url || "https://via.placeholder.com/400" }}
          style={styles.propertyImage}
        />
        <View style={styles.propertyDetails}>
          <Text style={styles.propertyText}>
            Beds: {property.bedrooms} bed
          </Text>
          <Text style={styles.propertyText}>
            Baths: {property.bathrooms} bath
          </Text>
          <Text style={styles.propertyText}>
            Pets: {property.pets_allowed ? "Pets allowed" : "No pets allowed"}
          </Text>
          <Text style={styles.propertyText}>Accessibility:</Text>
          {property.accessibility.length > 0 ? (
            property.accessibility.map((item, index) => (
              <Text key={index} style={styles.propertyText}>
                - {item}
              </Text>
            ))
          ) : (
            <Text style={styles.propertyText}>None</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {properties.length > 0 ? (
          <Swiper
            cards={properties}
            renderCard={(card) => renderCard(card)}
            onSwipedRight={(index) => handleSwipeRight(properties[index].id)}
            onSwipedLeft={(index) => handleSwipeLeft(properties[index].id)}
            cardIndex={0}
            stackSize={3}
            backgroundColor="transparent"
          />
        ) : (
          <View style={styles.noData}>
            <Text style={styles.propertyText}>No properties available.</Text>
          </View>
        )}
        <View style={styles.matchButtonContainer}>
          <TouchableOpacity style={styles.swipeLeft}>
            <Text style={styles.buttonText}>❌</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.swipeRight}>
            <Text style={styles.buttonText}>✔️</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
