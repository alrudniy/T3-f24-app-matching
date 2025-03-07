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
  accessibilities?: string[];
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

  // Local state to track which image index we're on
  const [currentIndex, setCurrentIndex] = useState(0);

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
  // Arrow-based Carousel for Multiple Images
  // ------------------------------
  const handleNextImage = () => {
    if (!property?.images) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % property.images!.length);
  };

  const handlePrevImage = () => {
    if (!property?.images) return;
    setCurrentIndex((prevIndex) => {
      return (prevIndex + property.images!.length - 1) % property.images!.length;
    });
  };

  // ------------------------------
  // Render the image or carousel
  // ------------------------------
  const renderImages = () => {
    if (!property) return null;

    const { images, image_url } = property;
    // If multiple images exist, show arrow-based carousel
    if (images && images.length > 1) {
      const currentImageUri = images[currentIndex];

      return (
        <View style={styles.carouselContainer}>
          <Image
            source={{ uri: currentImageUri }}
            style={styles.carouselImage}
            resizeMode="cover"
          />

          {/* Left Arrow */}
          <TouchableOpacity style={styles.arrowLeft} onPress={handlePrevImage}>
            <Ionicons name="chevron-back-outline" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Right Arrow */}
          <TouchableOpacity style={styles.arrowRight} onPress={handleNextImage}>
            <Ionicons name="chevron-forward-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }

    // Otherwise, single image fallback
    const fallbackUri = image_url || "https://picsum.photos/400/300";
    return (
      <View style={styles.carouselContainer}>
        <Image
          source={{ uri: fallbackUri }}
          style={styles.carouselImage}
          resizeMode="cover"
        />
      </View>
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
            {/* Image or Carousel Section */}
            {renderImages()}

            {/* Title / Address */}
            <Text style={styles.propertyTitle}>{property.name}</Text>
            <Text style={styles.propertyAddress}>
              {property.street_address}, {property.city}
            </Text>

            {/* Property Info Rows */}
            <View style={styles.propertyInfoSection}>
              {/* Bedrooms */}
              <View style={styles.infoRowLarge}>
                <Ionicons name="bed-outline" size={24} color="#007BFF" style={styles.infoIcon} />
                <Text style={styles.infoRowText}>
                  {property.bedrooms} Bedrooms
                </Text>
              </View>

              {/* Bathrooms */}
              <View style={styles.infoRowLarge}>
                <Ionicons name="water-outline" size={24} color="#007BFF" style={styles.infoIcon} />
                <Text style={styles.infoRowText}>
                  {property.bathrooms} Bathrooms
                </Text>
              </View>

              {/* Price */}
              <View style={styles.infoRowLarge}>
                <Ionicons name="cash-outline" size={24} color="#007BFF" style={styles.infoIcon} />
                <Text style={styles.infoRowText}>
                  ${property.price?.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Accessibilities Section */}
            <Text style={styles.sectionHeader}>Accessibilities</Text>
            {property.accessibilities && property.accessibilities.length > 0 ? (
              <View style={styles.accessibilitySection}>
                {property.accessibilities.map((acc, index) => (
                  <View style={styles.accessibilityBox} key={index}>
                    <Text style={styles.accessibilityBoxText}>{acc}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noAccessMsg}>
                No specific accessibilities listed.
              </Text>
            )}

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
const imageWidth = width - 40; // subtract horizontal padding

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Carousel Container
  carouselContainer: {
    width: "100%",
    height: 280,
    marginBottom: 20,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  carouselImage: {
    width: imageWidth,
    height: 280,
    borderRadius: 10,
  },

  // Carousel Arrows
  arrowLeft: {
    position: "absolute",
    left: 20,
    top: "50%",
    transform: [{ translateY: -14 }],
    zIndex: 2,
  },
  arrowRight: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -14 }],
    zIndex: 2,
  },

  // Titles / Headings
  propertyTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  propertyAddress: {
    fontSize: 20,
    fontWeight: "600",
    color: "#555",
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },

  // Property Info
  propertyInfoSection: {
    marginBottom: 20,
  },
  infoRowLarge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 15,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoRowText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },

  // Accessibilities
  accessibilitySection: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  accessibilityBox: {
    backgroundColor: "#007BFF22",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  accessibilityBoxText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "600",
  },
  noAccessMsg: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 20,
  },

  // Description
  description: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 20,
  },

  // Back button
  backButton: {
    backgroundColor: "#666",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 5,
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
