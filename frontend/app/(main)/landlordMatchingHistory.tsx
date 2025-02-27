import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { container, image, text } from "./styles";

/**
 * Shape of each match record returned from the backend (tenant-property combos).
 */
interface RawMatchedTenant {
  id: number;                       // tenant's user ID
  tenantFirstName: string;
  tenantLastName: string;
  tenantProfileImageUrl: string;
  propertyId?: number;              
  propertyName?: string;            
}

/**
 * Shape for our grouped list: each tenant + an array of the matched properties.
 */
interface GroupedTenant {
  id: number;
  tenantFirstName: string;
  tenantLastName: string;
  tenantProfileImageUrl: string;
  properties: {
    propertyId: number;
    propertyName: string;
  }[];
}

export default function LandlordMatchingHistoryView() {
  const [matchedTenants, setMatchedTenants] = useState<GroupedTenant[]>([]);
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
        const rawList: RawMatchedTenant[] = data.matched_tenants;

        // Group multiple property matches per tenant
        const groupedMap: Record<number, GroupedTenant> = {};

        rawList.forEach((item) => {
          if (!groupedMap[item.id]) {
            groupedMap[item.id] = {
              id: item.id,
              tenantFirstName: item.tenantFirstName,
              tenantLastName: item.tenantLastName,
              tenantProfileImageUrl: item.tenantProfileImageUrl,
              properties: [],
            };
          }

          // returns property info, push it into the array
          if (item.propertyId && item.propertyName) {
            groupedMap[item.id].properties.push({
              propertyId: item.propertyId,
              propertyName: item.propertyName,
            });
          }
        });

        // Convert our map back into an array
        const groupedTenants = Object.values(groupedMap);
        setMatchedTenants(groupedTenants);
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
              <View
                key={tenant.id}
                // Existing style + inline overrides for modern card look
                style={[
                  container.propertyCard,
                  {
                    marginVertical: 10,
                    marginHorizontal: 15,
                    padding: 15,
                    borderRadius: 10,
                    backgroundColor: "#fff",
                    // iOS shadow
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    // Android elevation
                    elevation: 2,
                  },
                ]}
              >
                {/* Tenant Profile Picture */}
                <Image
                  source={{
                    uri: tenant.tenantProfileImageUrl || "https://via.placeholder.com/150",
                  }}
                  style={image.profile}
                />

                {/* Tenant Details */}
                <View style={container.cardText}>
                  <Text style={[text.cardTitle, { marginBottom: 6 }]}>
                    {tenant.tenantFirstName} {tenant.tenantLastName}
                  </Text>

                  {tenant.properties.length > 0 && (
                    <View style={{ marginTop: 4 }}>
                      <Text style={[text.property, { fontWeight: "600", marginBottom: 2 }]}>
                        Matched Properties:
                      </Text>
                      {tenant.properties.map((prop) => (
                        <Text key={prop.propertyId} style={text.property}>
                          • {prop.propertyName}
                        </Text>
                      ))}
                    </View>
                  )}
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
          style={[
            container.navBarItem,
            segments[0] === "properties" && container.activeNavBarItem,
          ]}
          onPress={() => router.push("/(main)/properties")}
        >
          <Ionicons
            name="home"
            size={24}
            color={segments[0] === "properties" ? "#007BFF" : "#666"}
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
