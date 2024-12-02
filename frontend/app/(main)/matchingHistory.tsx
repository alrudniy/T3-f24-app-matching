import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { matchingHistoryStyles as styles } from "./styles";

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
      <SafeAreaView style={styles.container}>
        {loading ? (
          <Text style={styles.loadingText}>Loading matched properties...</Text>
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
                <View style={styles.cardTextContainer}>
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
    </SafeAreaProvider>
  );
}
