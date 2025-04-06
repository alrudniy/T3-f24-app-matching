import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet, Modal, TextInput } from "react-native";
import Swiper from "react-native-deck-swiper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";

import { general, button, image, container, text } from "./styles"; // Shared styles

interface Property {
  id: number;
  size_sqft: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  street: string;
  city: string;
  image_url: string;
  name: string;
  businessName: string;
  accessibilities?: string[];
}

export default function Matching() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [zipcode, setZipcode] = useState<string>("");
  const swiperRef = useRef<any>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/properties", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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

  const saveZipcode = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user/zipcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ zipcode }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setModalVisible(false);
        Alert.alert("Success", "Zip code updated.");
        fetchProperties();
      } else {
        Alert.alert("Error", result.message || "Failed to update zip code.");
      }
    } catch (error) {
      console.error("Error saving zip code:", error);
      Alert.alert("Error", "Could not update zip code. Please try again.");
    }
  };

  const handleSwipeRight = async (index: number) => {
    const property = properties[index];
    if (!property) return;

    try {
      const response = await fetch("http://localhost:5000/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    swiperRef.current?.swipeLeft();
  };

  const handleLike = () => {
    const currentIndex = swiperRef.current?.state.cardIndex ?? 0;
    swiperRef.current?.swipeRight();
    handleSwipeRight(currentIndex);
  };

  const handleSwipeLeft = (index: number) => {
    const property = properties[index];
    if (!property) return;
    console.log(`Property ${property.id} discarded`);
  };

  const goToPropertyListing = (propertyId: number) => {
    router.push({
      pathname: "/(main)/propertyListing",
      params: { id: propertyId.toString() },
    });
  };

  const renderCard = (property: Property) => {
    const access = property.accessibilities || [];
    const firstThree = access.slice(0, 3);
    const hasMore = access.length > 3;

    return (
      <View style={container.propertyCard}>
        <Image
          source={{ uri: property.image_url || "https://via.placeholder.com/400x300" }}
          style={image.property}
        />

        <View style={container.titleBanner}>
          <Text style={text.cardTitle}>{property.name}</Text>
          <Text style={text.cardSubtitle}>{property.businessName}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.leftColumn}>
            <View style={container.propertyRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={text.property}>
                {property.street}, {property.city}
              </Text>
            </View>
            <View style={container.propertyRow}>
              <Ionicons name="resize-outline" size={20} color="#666" />
              <Text style={text.property}>{property.size_sqft} sqft</Text>
            </View>
            <View style={container.propertyRow}>
              <Ionicons name="cash-outline" size={20} color="#666" />
              <Text style={text.property}>${property.price.toLocaleString()}</Text>
            </View>
            <View style={container.propertyRow}>
              <Ionicons name="bed-outline" size={20} color="#666" />
              <Text style={text.property}>{property.bedrooms} Beds</Text>
            </View>
            <View style={container.propertyRow}>
              <Ionicons name="water-outline" size={20} color="#666" />
              <Text style={text.property}>{property.bathrooms} Baths</Text>
            </View>
          </View>

          <View style={styles.rightColumn}>
            {access.length > 0 && (
              <>
                <Text style={styles.accHeader}>Accessibility</Text>
                {firstThree.map((accItem, index) => (
                  <View style={styles.accessibilityRow} key={index}>
                    <Ionicons name="arrow-forward-outline" size={18} color="#666" />
                    <Text style={styles.accessibilityText}>{accItem}</Text>
                  </View>
                ))}
                {hasMore && <Text style={styles.moreAccess}>...</Text>}
              </>
            )}
          </View>
        </View>

        <View style={container.cardButtons}>
          <TouchableOpacity style={button.circular} onPress={handleDislike}>
            <Ionicons name="close-outline" size={30} color="#FF3B30" />
          </TouchableOpacity>

          <TouchableOpacity
            style={button.circular}
            onPress={() => goToPropertyListing(property.id)}
          >
            <Ionicons name="information-circle-outline" size={30} color="#007BFF" />
          </TouchableOpacity>

          <TouchableOpacity style={button.circular} onPress={handleLike}>
            <Ionicons name="heart-outline" size={30} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
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

      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="location-outline" size={18} color="#333" style={{ marginRight: 6 }} />
          <Text style={styles.filterText}>{zipcode || "Set Zip Code"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => router.push("/preferencesAccessibility")}
        >
          <Ionicons name="options-outline" size={18} color="#333" style={{ marginRight: 6 }} />
          <Text style={styles.filterText}>Preferences</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Zip Code</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 10001"
              keyboardType="numeric"
              value={zipcode}
              onChangeText={setZipcode}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={saveZipcode}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={container.base}>
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
          <View style={container.noData}>
            <Text style={text.property}>No properties available.</Text>
          </View>
        )}
      </SafeAreaView>

      <View style={container.navBar}>
        <TouchableOpacity
          style={[container.navBarItem, segments[0] === "matching" && container.activeNavBarItem]}
          onPress={() => router.push("/matching")}
        >
          <Ionicons
            name="compass-outline"
            size={24}
            color={segments[0] === "matching" ? "#007BFF" : "#666"}
          />
          <Text style={[text.navBar, segments[0] === "matching" && text.activeNavBar]}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            container.navBarItem,
            segments[0] === "matchingHistory" && container.activeNavBarItem,
          ]}
          onPress={() => router.push("/matchingHistory")}
        >
          <Ionicons
            name="heart-outline"
            size={24}
            color={segments[0] === "matchingHistory" ? "#007BFF" : "#666"}
          />
          <Text style={[text.navBar, segments[0] === "matchingHistory" && text.activeNavBar]}>Matches</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  filterText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalCancel: {
    backgroundColor: '#ccc',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  leftColumn: {
    flex: 2,
    paddingRight: 10,
  },
  rightColumn: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  accHeader: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 5,
  },
  accessibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  accessibilityText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#333",
  },
  moreAccess: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginTop: 2,
  },
});
