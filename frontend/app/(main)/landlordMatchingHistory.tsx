import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { general, button, image, container, text } from "./styles";

interface MatchedTenant {
  id: number;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  // Add or remove any other fields you need from your backend
}

export default function LandlordMatchingHistoryView() {
  const [matchedTenants, setMatchedTenants] = useState<MatchedTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    fetchMatchedTenants();
  }, []);

  const fetchMatchedTenants = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/landlord/matched-tenants", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch matched tenants");
      }

      const data = await response.json();
      if (data.success) {
        setMatchedTenants(data.matched_tenants);
      } else {
        console.error("Error fetching matched tenants:", data.message);
      }
    } catch (error) {
      console.error("Error fetching matched tenants:", error);
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
          <Text style={text.loading}>Loading matched tenants...</Text>
        ) : matchedTenants.length > 0 ? (
          <ScrollView contentContainerStyle={container.inner}>
            {matchedTenants.map((tenant) => (
              <View key={tenant.id} style={container.propertyCard}>
                {/* Tenant Profile Picture */}
                <Image
                  source={{ uri: tenant.profileImageUrl || "https://via.placeholder.com/150" }}
                  style={image.profile}
                />

                {/* Tenant Details */}
                <View style={container.cardText}>
                  <Text style={text.cardTitle}>
                    {tenant.firstName} {tenant.lastName}
                  </Text>
                  {/* Add any additional tenant info here if desired */}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={container.noData}>No matched tenants found.</Text>
        )}
      </SafeAreaView>

      {/* Bottom Navigation */}
      <View style={container.navBar}>
        <TouchableOpacity
          style={[container.navBarItem, segments[0] === "properties" && container.activeNavBarItem]}
          onPress={() => router.push("/(main)/properties")}
        >
          <Ionicons
            name="home"
            size={24}
            color={segments[0] === "matching" ? "#007BFF" : "#666"}
          />
          <Text style={[text.navBar, segments[0] === "properties" && text.activeNavBar]}>
            Properties
          </Text>
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
            style={[text.navBar, segments[0] === "landlordMatchingHistory" && text.activeNavBar]}
          >
            Matches
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}
