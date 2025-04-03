import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
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
        headers: { "Content-Type": "application/json" },
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

          // If there's property info, push it into the array
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
      Alert.alert("Error", "Could not load matched tenants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render a single tenant in a wide horizontal card
  const renderTenantCard = (tenant: GroupedTenant) => {
    return (
      <View key={tenant.id} style={styles.tenantCard}>
        {/* Left Column: profile pic & name */}
        <View style={styles.leftColumn}>
          <Image
            source={{
              uri: tenant.tenantProfileImageUrl || "https://via.placeholder.com/150",
            }}
            style={styles.profileImage}
          />
          <Text style={styles.tenantName}>
            {tenant.tenantFirstName} {tenant.tenantLastName}
          </Text>
        </View>

        {/* Right Column: matched properties */}
        <View style={styles.rightColumn}>
          {tenant.properties.length > 0 && (
            <>
              <Text style={styles.propertiesHeader}>Matched Properties:</Text>
              {tenant.properties.map((prop) => (
                <TouchableOpacity
                  key={prop.propertyId}
                  onPress={() =>
                    router.push({
                      pathname: "/(main)/propertyListing",
                      params: { id: prop.propertyId.toString() },
                    })
                  }
                  style={styles.propertyLink}
                >
                  <Ionicons name="arrow-forward-outline" size={18} color="#666" />
                  <Text style={styles.propertyLinkText}>{prop.propertyName}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      {/* Header */}
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

      {/* Main Content */}
      <SafeAreaView style={container.base}>
        {loading ? (
          <Text style={text.loading}>Loading matched tenants...</Text>
        ) : matchedTenants.length > 0 ? (
          <ScrollView contentContainerStyle={{ paddingVertical: 15 }}>
            {matchedTenants.map((tenant) => renderTenantCard(tenant))}
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
          <Text
            style={[text.navBar, segments[0] === "properties" && text.activeNavBar]}
          >
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
            style={[
              text.navBar,
              segments[0] === "landlordMatchingHistory" && text.activeNavBar,
            ]}
          >
            Matches
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}

// ------------------------------
// Styles
// ------------------------------
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  tenantCard: {
    // Full width
    width: width * 0.95,
    alignSelf: "center",

    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,

    // Elevation for Android
    elevation: 3,
  },
  leftColumn: {
    width: 100, // fixed width for profile image & name
    alignItems: "center",
    justifyContent: "flex-start",
    marginRight: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 10, // slight rounding for a modern look
    marginBottom: 8,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  rightColumn: {
    flex: 1,
    justifyContent: "flex-start",
  },
  propertiesHeader: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  propertyLink: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  propertyLinkText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#007BFF", // Link color
  },
});
