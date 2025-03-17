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
  accessibilities?: string[]; // For example: ["Balcony", "Multiple floors", "Large lot"]
}

interface ApiResponse {
  success: boolean;
  property?: Property;
  message?: string;
}

// Mapping from accessibility label to an Ionicons name.
// Update these as needed.
const accessibilityIconMapping: { [key: string]: string } = {
  "Balcony": "sunny-outline",
  "Multiple floors": "layers-outline",
  "wheelchair access": "accessibility-outline",
  "Pet friendly": "paw-outline",
  "Large Lot": "expand-outline",
  "Low cost": "wallet-outline",
  "Close to shopping": "pricetag-outline",
  "Close to police station": "shield-outline",
  "Close to hospital": "medkit-outline",
  "Close to fire station": "flame-outline",
  "Close to park": "map-outline",
  "Close to school": "book-outline",
  "Close to public transportation": "train-outline",
  "Neighboorhood safety": "ribbon-outline",
  "Storage space": "cube-outline",
};

export default function PropertyListing() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const propertyId = Array.isArray(id) ? id[0] : id;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  // Local state to track which image index we're on (for carousel)
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
    setCurrentIndex((prevIndex) => (prevIndex + property.images!.length - 1) % property.images!.length);
  };

  // ------------------------------
  // Render the image or carousel
  // ------------------------------
  const renderImages = () => {
    if (!property) return null;
    const { images, image_url } = property;
    if (images && images.length > 1) {
      const currentImageUri = images[currentIndex];
      return (
        <View style={styles.carouselContainer}>
          <Image
            source={{ uri: currentImageUri }}
            style={styles.carouselImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.arrowLeft} onPress={handlePrevImage}>
            <Ionicons name="chevron-back-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowRight} onPress={handleNextImage}>
            <Ionicons name="chevron-forward-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }
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

  return (
    <SafeAreaProvider>
      {/* ---------- Header Section ---------- */}
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

      {/* ---------- Main Container ---------- */}
      <View style={styles.container}>
        {loading ? (
          <Text>Loading...</Text>
        ) : property ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {renderImages()}

            {/* Title & Address */}
            <Text style={styles.propertyTitle}>{property.name}</Text>
            <Text style={styles.propertyAddress}>
              {property.street_address}, {property.city}
            </Text>

            {/* Description Section */}
            {property.description ? (
              <View style={styles.descriptionBox}>
                <Text style={styles.sectionHeader}>Description</Text>
                <Text style={styles.descriptionText}>{property.description}</Text>
              </View>
            ) : null}

            {/* Property Info Section (Price first, then others) */}
            <View style={styles.propertyInfoSection}>
              <View style={styles.infoRowLarge}>
                <Ionicons name="cash-outline" size={24} color="#007BFF" style={styles.infoIcon} />
                <Text style={styles.infoRowText}>${property.price?.toLocaleString()}</Text>
              </View>
              <View style={styles.infoRowLarge}>
                <Ionicons name="bed-outline" size={24} color="#007BFF" style={styles.infoIcon} />
                <Text style={styles.infoRowText}>{property.bedrooms} Bedrooms</Text>
              </View>
              <View style={styles.infoRowLarge}>
                <Ionicons name="water-outline" size={24} color="#007BFF" style={styles.infoIcon} />
                <Text style={styles.infoRowText}>{property.bathrooms} Bathrooms</Text>
              </View>
            </View>

            {/* Accessibilities Section */}
            <Text style={styles.sectionHeader}>Accessibilities</Text>
            {property.accessibilities && property.accessibilities.length > 0 ? (
              <View style={styles.accessibilitySection}>
                {property.accessibilities.map((acc, index) => {
                  // Use the returned accessibility text to look up an icon.
                  const iconName = accessibilityIconMapping[acc as any] || "information-circle-outline";
                  return (
                    <View style={styles.accessibilityBox} key={index}>
                      <View style={styles.accessibilityIconContainer}>
                        <Ionicons name={iconName as any} size={24} color="#007BFF" />
                      </View>
                      <View style={styles.accessibilityLabelContainer}>
                        <Text style={styles.accessibilityBoxText}>{acc}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}

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

      {/* ---------- Bottom Navigation (unchanged) ---------- */}
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
const imageWidth = width - 40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 80, // Increased padding to avoid nav bar overlap
  },
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
  descriptionBox: {
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
  },
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },
  accessibilitySection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  accessibilityBox: {
    flexBasis: "48%",
    backgroundColor: "#007BFF22",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  accessibilityIconContainer: {
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  accessibilityLabelContainer: {
    flex: 1,
    justifyContent: "center",
  },
  accessibilityBoxText: {
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "600",
  },
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
  titleBox: {
    marginTop: 10,
    marginLeft: 15,
    marginBottom: 10,
  },
  businessSubtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#555",
  },
});
