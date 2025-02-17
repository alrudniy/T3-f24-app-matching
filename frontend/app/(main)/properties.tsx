import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // For icons
import { SafeAreaProvider } from "react-native-safe-area-context";
import { general, button, image, container, text } from "./styles";

// ------------------------------
// Interface Definitions
// ------------------------------

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
  businessName?: string; // Optional field for landlord's business
}

interface CurrentUser {
  id: number;
  name: string;
  email?: string;
  // ... any other fields your backend returns for the user
}

// ------------------------------
// Component
// ------------------------------
export default function PropertiesView() {
  const router = useRouter();
  const segments = useSegments(); // Ex: ["(main)", "properties"]

  // State to hold the current user
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // State to hold the list of properties
  const [properties, setProperties] = useState<Property[]>([]);

  // Loading state (for properties)
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // 1. Fetch current user data
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
  // 2. Fetch properties
  // ------------------------------
  const fetchProperties = async (userId?: number) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/properties");
      const data = await response.json();

      if (data.success) {
        if (userId) {
          const landlordProperties = data.properties.filter(
            (property: Property) => property.user_id === userId
          );
          setProperties(landlordProperties);
        } else {
          // Or show all properties if user ID is not set
          setProperties(data.properties);
        }
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

  // ------------------------------
  // useEffect Hooks
  // ------------------------------

  // On first render, attempt to load the current user
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Once the user is set, fetch that user's properties
  useEffect(() => {
    if (currentUser?.id) {
      fetchProperties(currentUser.id);
    }
  }, [currentUser]);

  // ------------------------------
  // Handle "Add Property"
  // ------------------------------
  const handleAddProperty = () => {
    router.push("/propertyCreation"); // Navigate to the property creation page
  };

  // ------------------------------
  // Render a single property card
  // ------------------------------
  const renderCard = (property: Property) => {
    return (
      <View key={property.id} style={styles.card}>
        <Image
          source={{
            uri: property.image_url || "https://picsum.photos/400/300",
          }}
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
            <Text style={styles.propertyText}>
              {property.price.toLocaleString()}
            </Text>
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

  // ------------------------------
  // Return the full component
  // ------------------------------
  return (
    <SafeAreaProvider>
      {/* ---------- Header Section ---------- */}
      <View style={container.loggedInHeader}>
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={image.loggedInHeaderIcon}
        >
          <Ionicons name="person-circle-outline" size={40} color="#333" />
        </TouchableOpacity>

        <Image
          source={require("./(home)/assets/images/icon_logo.png")}
          style={image.loggedInLogo}
          resizeMode="contain"
        />

        <TouchableOpacity
          onPress={() => router.push("/voucher")}
          style={image.loggedInHeaderIcon}
        >
          <Ionicons name="newspaper-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      {/* ---------- Main Container ---------- */}
      <View style={styles.container}>
        <Text style={styles.header}>My Properties</Text>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.propertyList}>
            {/* Render each property card */}
            {properties.map((property) => renderCard(property))}

            {/* Button to add a new property */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddProperty}>
              <Text style={styles.addButtonText}>Add a Property Listing</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* ---------- Bottom Navigation ---------- */}
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
            style={[
              text.navBar,
              segments[0] === "landlordMatchingHistory" && text.activeNavBar,
            ]}
          >
            Matches
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}

// ------------------------------
// Styles
// ------------------------------
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
    // Shadow for Android
    elevation: 5,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
