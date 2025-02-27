import React, { useState, useEffect } from "react";
import { View, Text, Button, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // For the icons
import { SafeAreaProvider } from "react-native-safe-area-context";
import { general, button, image, container, text } from "./styles"; // Importing the provided styles

// Define the property type
interface Property {
  id: number;
  name: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  street_address: string;
  city: string;
  image_url: string;
  user_id: number;
  businessName?: string; // Optional for landlords
}

export default function PropertiesView() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]); // Specify the type of the state
  const [loading, setLoading] = useState(true);
  const segments = useSegments(); // Use segments to get the current route

  // Fetch properties from the API
  const fetchProperties = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/properties");
      const data = await response.json();

      if (data.success) {
        // Filter properties by landlord user
        const landlordProperties = data.properties.filter(
          (property: Property) => property.user_id === 58 // Replace with dynamic user ID
        );
        setProperties(landlordProperties);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch properties.");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      Alert.alert("Error", "Could not load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Handle the "Add Property" button click
  const handleAddProperty = () => {
    router.push("/propertyCreation"); // Navigate to the property creation page
  };

  const renderCard = (property: Property) => {
    return (
      <View key={property.id} style={styles.card}>
        <Image
                  source={{ uri: property.image_url || "https://via.placeholder.com/400x300" }}
                  style={styles.propertyImage}
                />
        <View style={styles.propertyDetails}>
          <Text style={styles.propertyName}>{property.name}</Text>
          <View style={styles.propertyRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.propertyText}>
              {property.street_address}, {property.city}
            </Text>
          </View>
          <View style={styles.propertyRow}>
            <Ionicons name="resize-outline" size={20} color="#666" />
            <Text style={styles.propertyText}>{property.price.toLocaleString()}</Text>
          </View>
          <View style={styles.propertyRow}>
            <Ionicons name="bed-outline" size={20} color="#666" />
            <Text style={styles.propertyText}>{property.bedrooms} Beds</Text>
          </View>
          <View style={styles.propertyRow}>
            <Ionicons name="water-outline" size={20} color="#666" />
            <Text style={styles.propertyText}>{property.bathrooms} Baths</Text>
          </View>
        </View>
      </View>
    );
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
        
      <View style={styles.container}>
        
        <Text style={styles.header}>My Properties</Text>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.propertyList}>
            {properties.map((property) => renderCard(property))}
            
            {/* Add property listing button below the property cards */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddProperty}>
              <Text style={styles.addButtonText}>Add a Property Listing</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
      {/* Bottom Navigation */}
      <View style={container.navBar}>
        <TouchableOpacity
          style={[container.navBarItem, segments[1] === "properties" && container.activeNavBarItem]}
          onPress={() => router.push("/(main)/properties")}
        >
        <Ionicons
          name="home" size={24} color={ segments[1] === "properties" ? "#007BFF" : "#666"}/>
        <Text style={text.navBar}>Properties</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  propertyList: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  propertyImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  propertyDetails: {
    padding: 5,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  propertyBusiness: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  propertyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  propertyText: {
    marginLeft: 5,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 50,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
