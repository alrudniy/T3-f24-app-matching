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
  image_url: string; // Single image fallback
  images?: string[]; // Optional array of multiple images
  user_id: number;
  businessName?: string;
  description?: string; 
  accessibilities?: string[]; // If your backend sends an array of strings
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
  const { id } = useLocalSearchParams();
  const propertyId = Array.isArray(id) ? id[0] : id;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // Fetch property details by ID
  // ------------------------------
  const fetchPropertyDetails = async (propId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/properties/${propId}`);
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
  // Render the image carousel or single image
  // ------------------------------
  const renderImages = () => {
    if (!property) return null;

    // If multiple images exist
    if (property.images && property.images.length > 1) {
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

    // Otherwise, single image fallback
    const fallbackUri = property.image_url || "https://picsum.photos/400/300";
    return (
      <Image
        source={{ uri: fallbackUri }}
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
            {/* Image Section */}
            {renderImages()}

            {/* Title / Name */}
            <Text style={styles.title}>{property.name}</Text>

            {/* Two Columns: Left - property details, Right - accessibilities */}
            <View style={styles.detailsContainer}>
              {/* Left Column - Basic Details */}
              <View style={styles.leftColumn}>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>
                    {property.street_address}, {property.city}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="bed-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>
                    {property.bedrooms} Beds
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="water-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>
                    {property.bathrooms} Baths
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>
                    ${property.price?.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Right Column - Accessibilities */}
              <View style={styles.rightColumn}>
                <Text style={styles.sectionHeader}>Accessibilities</Text>
                {property.accessibilities && property.accessibilities.length > 0 ? (
                  property.accessibilities.map((acc, index) => (
                    <View style={styles.accessibilityRow} key={index}>
                      <Ionicons name="arrow-forward-outline" size={18} color="#666" />
                      <Text style={styles.accessibilityText}>{acc}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noAccessMsg}>
                    No specific accessibilities listed.
                  </Text>
                )}
              </View>
            </View>

            {/* Optional description */}
            {property.description && (
              <Text style={styles.description}>{property.description}</Text>
            )}

            {/* Back Button */}
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

  // Carousel or Single Image
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

  // Titles / Headings
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 5,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  // Two Column Layout
  detailsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  leftColumn: {
    flex: 1,
    marginRight: 10,
  },
  rightColumn: {
    flex: 1,
    marginLeft: 10,
  },

  // Info Rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
  },

  // Accessibilities
  accessibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  accessibilityText: {
    marginLeft: 8,
    fontSize: 15,
  },
  noAccessMsg: {
    fontSize: 15,
    fontStyle: "italic",
  },

  // Description
  description: {
    marginTop: 15,
    fontSize: 16,
    lineHeight: 20,
  },

  // Back button
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
