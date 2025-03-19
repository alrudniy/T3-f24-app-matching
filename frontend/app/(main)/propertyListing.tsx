import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { container, image, text } from "./styles";

// ------------------------------
// Mapping from accessibility label to an Ionicons name.
// ------------------------------
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
  images?: string[];
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

interface UserProfile {
  id: number;
  businessName?: string;
  phone?: string;
  profile_picture?: string;
}

// ------------------------------
// Helper function to format phone numbers as (xxx) xxx-xxxx
// ------------------------------
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export default function PropertyListing() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const propertyId = Array.isArray(id) ? id[0] : id;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // New states for edit mode
  const [editMode, setEditMode] = useState(false);
  const [updatedProperty, setUpdatedProperty] = useState<Property | null>(null);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  // State to hold current user id (for checking property ownership)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // ------------------------------
  // Fetch property details by ID
  // ------------------------------
  const fetchPropertyDetails = async (propId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/properties/${propId}`);
      const data: ApiResponse = await response.json();
      if (data.success && data.property) {
        setProperty(data.property);
        // Also set the editable copy
        setUpdatedProperty(data.property);
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
  // Fetch user profile by user ID (for Listed By section)
  // ------------------------------
  const fetchUserProfileById = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // ------------------------------
  // Fetch current logged in user ID (for edit permission)
  // ------------------------------
  const fetchCurrentUserId = async () => {
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
        setCurrentUserId(data.user.id);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails(propertyId);
      fetchCurrentUserId();
    } else {
      setLoading(false);
      Alert.alert("Error", "No property ID was provided.");
    }
  }, [propertyId]);

  useEffect(() => {
    if (property && property.user_id) {
      fetchUserProfileById(property.user_id);
    }
  }, [property]);

  // ------------------------------
  // Arrow-based Carousel for Multiple Images (view mode)
  // ------------------------------
  const handleNextImage = () => {
    if (!property?.images) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % property.images!.length);
  };

  const handlePrevImage = () => {
    if (!property?.images) return;
    setCurrentIndex((prevIndex) => (prevIndex + property.images!.length - 1) % property.images!.length);
  };

  const renderImages = () => {
    if (!property) return null;
    const { images, image_url } = property;
    if (images && images.length > 1) {
      const currentImageUri = images[currentIndex];
      return (
        <View style={styles.imageContainer}>
          <Image source={{ uri: currentImageUri }} style={styles.carouselImage} resizeMode="cover" />
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
      <View style={styles.imageContainer}>
        <Image source={{ uri: fallbackUri }} style={styles.carouselImage} resizeMode="cover" />
      </View>
    );
  };

  // ------------------------------
  // Edit Mode: Image Upload & Deletion
  // ------------------------------
  const handleAddImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNewImages([...newImages, result.assets[0].uri]);
    }
  };

  const handleDeleteImage = (imageUri: string) => {
    if (property?.images?.includes(imageUri)) {
      setDeletedImages([...deletedImages, imageUri]);
    } else {
      setNewImages(newImages.filter((img) => img !== imageUri));
    }
  };

  // ------------------------------
  // Save Changes from Edit Mode
  // ------------------------------
  const handleSaveChanges = async () => {
    if (!updatedProperty) return;
    const formData = new FormData();
    formData.append("name", updatedProperty.name);
    formData.append("price", String(updatedProperty.price));
    formData.append("bedrooms", String(updatedProperty.bedrooms));
    formData.append("bathrooms", String(updatedProperty.bathrooms));
    formData.append("street_address", updatedProperty.street_address);
    formData.append("city", updatedProperty.city);
    formData.append("description", updatedProperty.description || "");

    deletedImages.forEach((img) => formData.append("delete_image_ids", img));

    newImages.forEach((uri, index) => {
      formData.append("new_images", {
        uri,
        type: "image/jpeg",
        name: `new_image_${index}.jpg`,
      } as any);
    });

    try {
      const response = await fetch(`http://localhost:5000/property/edit/${propertyId}`, {
        method: "PUT",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Property updated successfully.");
        fetchPropertyDetails(propertyId);
        setEditMode(false);
        setNewImages([]);
        setDeletedImages([]);
      } else {
        Alert.alert("Error", data.message || "Failed to update property.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <SafeAreaProvider>
      {/* ---------- Header Section (without gear button) ---------- */}
      <View style={container.loggedInHeader}>
        <TouchableOpacity onPress={() => router.push("/profile")} style={image.loggedInHeaderIcon}>
          <Ionicons name="person-circle-outline" size={40} color="#333" />
        </TouchableOpacity>
        <Image source={require("./(home)/assets/images/icon_logo.png")} style={image.loggedInLogo} resizeMode="contain" />
        <TouchableOpacity onPress={() => router.push("/voucher")} style={image.loggedInHeaderIcon}>
          <Ionicons name="newspaper-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      {/* ---------- Main Container ---------- */}
      <View style={styles.container}>
        {/* Edit/Save Button placed at the top right of the main container */}
        <View style={styles.editButtonContainer}>
          {currentUserId === property?.user_id && (
            <TouchableOpacity
              onPress={() => {
                if (editMode) {
                  handleSaveChanges();
                } else {
                  setEditMode(true);
                }
              }}
            >
              <Ionicons name={editMode ? "save-outline" : "settings-outline"} size={30} color="#333" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <Text>Loading...</Text>
        ) : property ? (
          editMode ? (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Edit Form */}
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.input}
                  value={updatedProperty?.name}
                  onChangeText={(text) => setUpdatedProperty({ ...updatedProperty!, name: text })}
                  placeholder="Property Name"
                />
                <TextInput
                  style={styles.input}
                  value={String(updatedProperty?.price)}
                  keyboardType="numeric"
                  onChangeText={(text) => setUpdatedProperty({ ...updatedProperty!, price: parseFloat(text) })}
                  placeholder="Price"
                />
                <TextInput
                  style={styles.input}
                  value={String(updatedProperty?.bedrooms)}
                  keyboardType="numeric"
                  onChangeText={(text) => setUpdatedProperty({ ...updatedProperty!, bedrooms: parseInt(text) })}
                  placeholder="Bedrooms"
                />
                <TextInput
                  style={styles.input}
                  value={String(updatedProperty?.bathrooms)}
                  keyboardType="numeric"
                  onChangeText={(text) => setUpdatedProperty({ ...updatedProperty!, bathrooms: parseInt(text) })}
                  placeholder="Bathrooms"
                />
                <TextInput
                  style={styles.input}
                  value={updatedProperty?.street_address}
                  onChangeText={(text) => setUpdatedProperty({ ...updatedProperty!, street_address: text })}
                  placeholder="Street Address"
                />
                <TextInput
                  style={styles.input}
                  value={updatedProperty?.city}
                  onChangeText={(text) => setUpdatedProperty({ ...updatedProperty!, city: text })}
                  placeholder="City"
                />
                <TextInput
                  style={styles.input}
                  value={updatedProperty?.description}
                  onChangeText={(text) => setUpdatedProperty({ ...updatedProperty!, description: text })}
                  placeholder="Description"
                  multiline
                />

                {/* Image Management */}
                <FlatList
                  data={[...(updatedProperty?.images || []), ...newImages]}
                  horizontal
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.imagePreview}>
                      <Image source={{ uri: item }} style={styles.image} />
                      <TouchableOpacity onPress={() => handleDeleteImage(item)}>
                        <Ionicons name="trash-outline" size={24} color="red" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
                <TouchableOpacity onPress={handleAddImage}>
                  <Text>Add Image</Text>
                </TouchableOpacity>

                {/* Listed By Section (unchanged) */}
                <Text style={styles.descriptionTitle}>Listed By</Text>
                {userProfile ? (
                  <View style={styles.listedByCard}>
                    <View style={styles.listedByLeft}>
                      {userProfile.profile_picture ? (
                        <Image source={{ uri: userProfile.profile_picture }} style={styles.profileImage} resizeMode="cover" />
                      ) : (
                        <Ionicons name="person-circle-outline" size={40} color="#007BFF" />
                      )}
                    </View>
                    <View style={styles.listedByRight}>
                      <Text style={styles.listedByBusinessName}>{userProfile.businessName}</Text>
                      <Text style={styles.listedByUserPhone}>
                        {userProfile.phone ? formatPhoneNumber(userProfile.phone) : ""}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                  <Text style={styles.backButtonText}>
                    <Ionicons name="arrow-back" size={16} color="#fff" /> Go Back
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {renderImages()}

              {/* Title & Address */}
              <Text style={styles.propertyTitle}>{property.name}</Text>
              <Text style={styles.propertyAddress}>
                {property.street_address}, {property.city}
              </Text>

              {/* Description Section */}
              {property.description ? (
                <>
                  <Text style={styles.descriptionTitle}>Description</Text>
                  <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>{property.description}</Text>
                  </View>
                </>
              ) : null}

              {/* Details Section */}
              <Text style={styles.descriptionTitle}>Details</Text>
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={24} color="#007BFF" style={styles.infoIcon} />
                  <Text style={styles.infoRowText}>${property.price?.toLocaleString()}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="bed-outline" size={24} color="#007BFF" style={styles.infoIcon} />
                  <Text style={styles.infoRowText}>{property.bedrooms} Bedrooms</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="water-outline" size={24} color="#007BFF" style={styles.infoIcon} />
                  <Text style={styles.infoRowText}>{property.bathrooms} Bathrooms</Text>
                </View>
              </View>

              {/* Accessibilities Section */}
              <Text style={styles.descriptionTitle}>Accessibilities</Text>
              {property.accessibilities && property.accessibilities.length > 0 ? (
                <View style={styles.accessibilityContainer}>
                  <View style={styles.accessibilitySection}>
                    {property.accessibilities.map((acc, index) => {
                      const iconName = accessibilityIconMapping[acc] || "information-circle-outline";
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
                </View>
              ) : null}

              {/* Listed By Section */}
              <Text style={styles.descriptionTitle}>Listed By</Text>
              {userProfile ? (
                <View style={styles.listedByCard}>
                  <View style={styles.listedByLeft}>
                    {userProfile.profile_picture ? (
                      <Image source={{ uri: userProfile.profile_picture }} style={styles.profileImage} resizeMode="cover" />
                    ) : (
                      <Ionicons name="person-circle-outline" size={40} color="#007BFF" />
                    )}
                  </View>
                  <View style={styles.listedByRight}>
                    <Text style={styles.listedByBusinessName}>{userProfile.businessName}</Text>
                    <Text style={styles.listedByUserPhone}>
                      {userProfile.phone ? formatPhoneNumber(userProfile.phone) : ""}
                    </Text>
                  </View>
                </View>
              ) : null}

              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>
                  <Ionicons name="arrow-back" size={16} color="#fff" /> Go Back
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )
        ) : (
          <Text>No property data found.</Text>
        )}
      </View>

      {/* ---------- Bottom Navigation (unchanged) ---------- */}
      <View style={container.navBar}>
        <TouchableOpacity style={[container.navBarItem]} onPress={() => router.push("/(main)/properties")}>
          <Ionicons name="home" size={24} color="#666" />
          <Text style={text.navBar}>Properties</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[container.navBarItem]} onPress={() => router.push("/(main)/landlordMatchingHistory")}>
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
  imageContainer: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 5,
    marginBottom: 20,
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
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  arrowRight: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -14 }],
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
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
  descriptionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#333",
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
  infoContainer: {
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
  accessibilityContainer: {
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  accessibilitySection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
  listedByCard: {
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  listedByLeft: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  listedByRight: {
    flex: 1,
  },
  listedByBusinessName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  listedByUserPhone: {
    fontSize: 16,
    color: "#333",
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
  // New styles for edit mode:
  editContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 10,
  },
  input: {
    borderBottomWidth: 1,
    marginVertical: 5,
    padding: 8,
    fontSize: 16,
    backgroundColor: "#f7f7f7",
    borderRadius: 5,
  },
  imagePreview: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  // New style for the edit/save button container in the main section
  editButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: 10,
  },
});
