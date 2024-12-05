import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { styles } from "./styles";
import { matchingHistoryStyles as style } from "./styles";

interface MatchedProperty {
  id: number;
  name: string;
  size_sqft: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  street: string;
  city: string;
  image_url: string;
  businessName: string | null;
}

export default function MatchingHistoryView() {
  const [matchedProperties, setMatchedProperties] = useState<MatchedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    fetchMatchedProperties();
  }, []);

  const fetchMatchedProperties = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user/matched-properties", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch matched properties");
      }

      const data = await response.json();
      if (data.success) {
        setMatchedProperties(data.matched_properties);
      } else {
        console.error("Error fetching matched properties:", data.message);
      }
    } catch (error) {
      console.error("Error fetching matched properties:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      {/* LoggedInHeader */}
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

      {/* Main Content */}
      <SafeAreaView style={styles.container}>
        {loading ? (
          <Text style={style.loadingText}>Loading matched properties...</Text>
        ) : matchedProperties.length > 0 ? (
          <ScrollView contentContainerStyle={styles.innerContainer}>
            {matchedProperties.map((property) => (
              <View key={property.id} style={styles.propertyCard}>
                {/* Property Image */}
                <Image
                  source={{ uri: property.image_url || "https://via.placeholder.com/150" }}
                  style={styles.profileImage}
                />

                {/* Property Details */}
                <View style={style.cardTextContainer}>
                  <Text style={styles.cardTitle}>{property.name}</Text>
                  {property.businessName && (
                    <Text style={styles.cardSubtitle}>Owner: {property.businessName}</Text>
                  )}
                  <Text style={styles.propertyText}>
                    Location: {property.street}, {property.city}
                  </Text>
                  <Text style={styles.propertyText}>
                    Bed: {property.bedrooms}, Bath: {property.bathrooms}, Size: {property.size_sqft} sqft
                  </Text>
                  <Text style={styles.propertyText}>Price: ${property.price.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noData}>No matched properties found.</Text>
        )}
      </SafeAreaView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity
          style={[styles.navBarItem, segments[0] === "matching" && styles.activeNavBarItem]}
          onPress={() => router.push("/matching")}
        >
          <Ionicons
            name="compass-outline"
            size={24}
            color={segments[0] === "matching" ? "#007BFF" : "#666"}
          />
          <Text style={[styles.navBarText, segments[0] === "matching" && styles.activeNavBarText]}>
            Explore
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navBarItem, segments[0] === "matchingHistory" && styles.activeNavBarItem]}
          onPress={() => router.push("/matchingHistory")}
        >
          <Ionicons
            name="heart-outline"
            size={24}
            color={segments[0] === "matchingHistory" ? "#007BFF" : "#666"}
          />
          <Text
            style={[styles.navBarText, segments[0] === "matchingHistory" && styles.activeNavBarText]}
          >
            Matches
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}
