import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router"; 

// Import your shared styles
import { container, image, text } from "./styles";

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
  image_url: string;     // Single image
  images?: string[];     // Optional array of multiple images
  user_id: number;
  businessName?: string; 
  description?: string;  // If your API includes a description
}

interface ApiResponse {
  success: boolean;
  property?: Property;
  message?: string;
}

// ------------------------------
// Main Component
// ------------------------------
export default function PropertyListing() {
  const router = useRouter();

  // Pull the "id" route parameter (e.g., /propertyListing?id=123)
  const { id } = useLocalSearchParams();
  // Force picking the first value if id is an array
  const propertyId = Array.isArray(id) ? id[0] : id;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // Fetch property details by ID
  // ------------------------------
  const fetchPropertyDetails = async (propId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/properties/${propId}`);
      const data: ApiResponse = await response.json();
      if (data.success && data.property) {
        setProperty(data.property);
      } else {
        Alert.alert("Error", data.message || "Failed to load property data.");
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      Alert.alert("Error", "Could not load property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // useEffect to load property
  // ------------------------------
  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails(propertyId);
    } else {
      setLoading(false);
      Alert.alert("Error", "No property ID was provided.");
    }
  }, [propertyId]);

  // ------------------------------
  // Render the image carousel
  // ------------------------------
  const renderImages = () => {
    // If there's an array of multiple images, display them in a horizontal scroll
    if (property?.images && property.images.length > 0) {
      return (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
        >
          {property.images.map((imgUrl, index) => (
            <Image
              key={index}
              source={{ uri: imgUrl }}
              style={styles.carouselImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      );
    }

    // Otherwise, show the single image
    return (
      <Image
        source={{
          uri: property?.image_url || "https://picsum.photos/400/300",
        }}
        style={styles.carouselImage}
        resizeMode="cover"
      />
    );
  };

  // ------------------------------
  // Main render
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
        {loading ? (
          <Text>Loading...</Text>
        ) : property ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Image(s) */}
            {renderImages()}

            {/* Property Info */}
            <Text style={styles.title}>{property.name}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                {property.street_address}, {property.city}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="bed-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{property.bedrooms} Beds</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="water-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{property.bathrooms} Baths</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                ${property.price?.toLocaleString()}
              </Text>
            </View>

            {/* Optional description or extra fields */}
            {property.description && (
              <Text style={styles.description}>{property.description}</Text>
            )}

            {/* Back button or any additional actions */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>
                <Ionicons name="arrow-back" size={16} color="#fff" /> Go Back
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <Text>No property data found.</Text>
        )}
      </View>

      {/* ---------- Bottom Navigation ---------- */}
      <View style={container.navBar}>
        <TouchableOpacity
          style={[container.navBarItem]}
          onPress={() => router.push("/(main)/properties")}
        >
          <Ionicons name="home" size={24} color="#666" />
          <Text style={text.navBar}>Properties</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[container.navBarItem]}
          onPress={() => router.push("/(main)/landlordMatchingHistory")}
        >
          <Ionicons name="heart-outline" size={24} color="#666" />
          <Text style={text.navBar}>Matches</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}

// ------------------------------
// Local Styles
// ------------------------------
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  carousel: {
    width: "100%",
    height: 250,
    marginBottom: 20,
  },
  carouselImage: {
    width: width - 40, // subtract horizontal padding
    height: 250,
    borderRadius: 10,
    marginRight: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
  },
  description: {
    marginTop: 15,
    fontSize: 16,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: "#666",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 5,
  },
});
