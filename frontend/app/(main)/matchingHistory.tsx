import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { general, button, image, container, text } from "./styles";

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
      <View style={container.loggedInHeader}>
        {/* Profile Icon */}
        <TouchableOpacity onPress={() => router.push("/profile")} style={image.loggedInHeaderIcon}>
          <Ionicons name="person-circle-outline" size={40} color="#333" />
        </TouchableOpacity>

        {/* Logo */}
        <Image
          source={require("./(home)/assets/images/icon_logo.png")}
          style={image.loggedInLogo}
          resizeMode="contain"
        />

        {/* Paper/Info Icon */}
        <TouchableOpacity onPress={() => router.push("/voucher")} style={image.loggedInHeaderIcon}>
          <Ionicons name="newspaper-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <SafeAreaView style={container.base}>
        {loading ? (
          <Text style={text.loading}>Loading matched properties...</Text>
        ) : matchedProperties.length > 0 ? (
          <ScrollView contentContainerStyle={container.inner}>
            {matchedProperties.map((property) => (
              <View key={property.id} style={container.propertyCard}>
                {/* Property Image */}
                <Image
                  source={{ uri: property.image_url || "https://via.placeholder.com/150" }}
                  style={container.profile}
                />

                {/* Property Details */}
                <View style={container.cardText}>
                  <Text style={text.cardTitle}>{property.name}</Text>
                  {property.businessName && (
                    <Text style={text.cardSubtitle}>Owner: {property.businessName}</Text>
                  )}
                  <Text style={text.property}>
                    Location: {property.street}, {property.city}
                  </Text>
                  <Text style={text.property}>
                    Bed: {property.bedrooms}, Bath: {property.bathrooms}, Size: {property.size_sqft} sqft
                  </Text>
                  <Text style={text.property}>Price: ${property.price.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={container.noData}>No matched properties found.</Text>
        )}
      </SafeAreaView>

      {/* Bottom Navigation */}
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
          <Text style={[text.navBar, segments[0] === "matching" && text.activeNavBar]}>
            Explore
          </Text>
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
