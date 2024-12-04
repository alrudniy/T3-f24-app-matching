import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import Swiper from "react-native-deck-swiper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // Importing icons
import { useRouter } from "expo-router"; // Router for navigation
import { styles } from "./styles"; // Importing the provided styles

interface Property {
  id: number;
  size_sqft: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  street: string;
  city: string;
  image_url: string;
  name: string; // User's first name
  businessName: string; // User's business name
}

export default function Matching() {
  const [properties, setProperties] = useState<Property[]>([]);
  const swiperRef = useRef<any>(null); // Use `any` because `react-native-deck-swiper` lacks proper TypeScript types
  const router = useRouter(); // Expo router for navigation

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
        Alert.alert("Error", data.message || "Failed to fetch properties.");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      Alert.alert("Error", "Could not load properties. Please try again.");
    }
  };

  const handleSwipeRight = async (index: number) => {
    const property = properties[index];
    if (!property) return;

    try {
      const response = await fetch("http://localhost:5000/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ property_id: property.id }),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert("Success", "You liked this property!");
      } else {
        console.error("Error matching property:", result.message);
        Alert.alert("Error", result.message || "Failed to process your swipe.");
      }
    } catch (error) {
      console.error("Error matching property:", error);
      Alert.alert("Error", "Could not process your swipe. Please try again.");
    }
  };

  const handleDislike = () => {
    swiperRef.current?.swipeLeft(); // Trigger a swipe left animation
  };

  const handleLike = () => {
    const currentIndex = swiperRef.current?.state.cardIndex ?? 0; // Safely access cardIndex
    swiperRef.current?.swipeRight(); // Trigger a swipe right animation
    handleSwipeRight(currentIndex);
  };

  const handleSwipeLeft = (index: number) => {
    const property = properties[index];
    if (!property) return;

    console.log(`Property ${property.id} discarded`);
  };

  const renderCard = (property: Property) => {
    return (
      <View style={styles.propertyCard}>
        <Image
          source={{ uri: property.image_url || "https://via.placeholder.com/400x300" }}
          style={styles.propertyImage}
        />
        <View style={styles.titleBanner}>
          <Text style={styles.cardTitle}>{property.name}</Text>
          <Text style={styles.cardSubtitle}>{property.businessName}</Text>
        </View>
        <View style={styles.propertyDetails}>
          <View style={styles.propertyRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.propertyText}>
              {property.street}, {property.city}
            </Text>
          </View>
          <View style={styles.propertyRow}>
            <Ionicons name="resize-outline" size={20} color="#666" />
            <Text style={styles.propertyText}>{property.size_sqft} sqft</Text>
          </View>
          <View style={styles.propertyRow}>
            <Ionicons name="cash-outline" size={20} color="#666" />
            <Text style={styles.propertyText}>${property.price.toLocaleString()}</Text>
          </View>
          <View style={styles.propertyRow}>
            <Ionicons name="bed-outline" size={20} color="#666" />
            <Text style={styles.propertyText}>{property.bedrooms} Beds</Text>
          </View>
          <View style={styles.propertyRow}>
            <Ionicons name="water-outline" size={20} color="#666" />
            <Text style={styles.propertyText}>{property.bathrooms} Baths</Text>
          </View>
          <View style={styles.cardButtonsContainer}>
            <TouchableOpacity style={styles.circularButton} onPress={handleDislike}>
              <Ionicons name="close-outline" size={30} color="#FF3B30" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circularButton} onPress={() => console.log("Info Button")}>
              <Ionicons name="information-circle-outline" size={30} color="#007BFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circularButton} onPress={handleLike}>
              <Ionicons name="heart-outline" size={30} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      {/* Header */}
      <View style={styles.LoggedInHeader}>
  {/* Profile Icon */}
  <TouchableOpacity onPress={() => router.push("/profile")} style={styles.LoggedInHeaderIcon}>
    <Ionicons name="person-circle-outline" size={40} color="#333" />
  </TouchableOpacity>

  {/* Logo */}
  <Image
    source={require("./(home)/assets/images/icon_logo.png")}
    style={styles.LoggedInLogo}
    resizeMode="contain"
  />

  {/* Paper/Info Icon */}
  <TouchableOpacity onPress={() => router.push("/voucher")} style={styles.LoggedInHeaderIcon}>
    <Ionicons name="newspaper-outline" size={30} color="#333" />
  </TouchableOpacity>
</View>


      <SafeAreaView style={styles.container}>
        {properties.length > 0 ? (
          <Swiper
            ref={swiperRef}
            cards={properties}
            renderCard={(card: Property) => renderCard(card)}
            onSwipedRight={(index: number) => handleSwipeRight(index)}
            onSwipedLeft={(index: number) => handleSwipeLeft(index)}
            cardIndex={0}
            stackSize={3}
            backgroundColor="transparent"
          />
        ) : (
          <View style={styles.noData}>
            <Text style={styles.propertyText}>No properties available.</Text>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
