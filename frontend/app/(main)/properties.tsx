import React, {useEffect, useState} from "react";
import {Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {useRouter, useSegments} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {container, image, text} from "./styles";
import {propertiesApiPropertiesGet, PropertyDetailData, usersApiCurrentUserGet} from "@/client";


interface CurrentUser {
    id: number;
    name: string;
    email?: string;
    // ... any other fields
}

// ------------------------------
// Main Component
// ------------------------------
export default function PropertiesView() {
    const router = useRouter();
    const segments = useSegments(); // e.g., ["(main)", "properties"]

    // State for current user
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    // State for properties
    const [properties, setProperties] = useState<PropertyDetailData[]>([]);

    // Loading state
    const [loading, setLoading] = useState(true);

    // ------------------------------
    // 1. Fetch current user data
    // ------------------------------
    const fetchCurrentUser = async () => {

        const {data, error} = await usersApiCurrentUserGet()

        if (data) {
            setCurrentUser(data.profile)
        } else if (error) {
            Alert.alert("Error", error.message || "Failed to load user data.");
        }
    };

    // ------------------------------
    // 2. Fetch properties
    // ------------------------------
    const fetchProperties = async (userId?: number) => {

        const {data, error} = await propertiesApiPropertiesGet()

        if (data) {
            if (userId) {
                // Show only that user's properties
                const landlordProperties = data.properties.filter(
                    (property) => property.user_id === userId
                );
                setProperties(landlordProperties);
            } else {
                // Show all properties
                setProperties(data.properties);
            }
        } else if (error) {
            Alert.alert("Error", error.message || "Failed to load properties.");
        }

        setLoading(false);
    };

    // ------------------------------
    // useEffect Hooks
    // ------------------------------
    useEffect(() => {
        // On mount, load current user
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        // Once we have a current user, fetch their properties
        if (currentUser?.id) {
            fetchProperties(currentUser.id);
        }
    }, [currentUser]);

    // ------------------------------
    // Handle "Add Property"
    // ------------------------------
    const handleAddProperty = () => {
        router.push("/propertyCreation");
    };

    // ------------------------------
    // Render a single property card
    // ------------------------------
    const renderCard = (property: PropertyDetailData) => {
        // Pre-calculate the first two accessibilities plus "..."
        const access = property.accessibilities || [];
        const firstTwo = access.slice(0, 2);
        const hasMore = access.length > 2;

        return (
            <TouchableOpacity
                key={property.id}
                style={styles.card}
                onPress={() =>
                    router.push({
                        pathname: "/(main)/propertyListing",
                        params: {id: property.id.toString()},
                    })
                }
            >
                {/* Property Image */}
                <Image
                    source={{
                        uri: property.image_url || "https://picsum.photos/400/300",
                    }}
                    style={styles.propertyImage}
                />

                {/* Main content container (two columns) */}
                <View style={styles.cardContent}>
                    {/* Left Column: Basic Property Info */}
                    <View style={styles.leftColumn}>
                        <Text style={styles.propertyName}>{property.name}</Text>

                        {/* Address */}
                        <View style={styles.propertyRow}>
                            <Ionicons name="location-outline" size={20} color="#666"/>
                            <Text style={styles.propertyText}>
                                {property.street_address}, {property.city}
                            </Text>
                        </View>

                        {/* Price */}
                        <View style={styles.propertyRow}>
                            <Ionicons name="cash-outline" size={20} color="#666"/>
                            <Text style={styles.propertyText}>
                                ${property.price.toLocaleString()}
                            </Text>
                        </View>

                        {/* Bedrooms */}
                        <View style={styles.propertyRow}>
                            <Ionicons name="bed-outline" size={20} color="#666"/>
                            <Text style={styles.propertyText}>
                                {property.bedrooms} Beds
                            </Text>
                        </View>

                        {/* Bathrooms */}
                        <View style={styles.propertyRow}>
                            <Ionicons name="water-outline" size={20} color="#666"/>
                            <Text style={styles.propertyText}>
                                {property.bathrooms} Baths
                            </Text>
                        </View>
                    </View>

                    {/* Right Column: First 2 Accessibilities & "..." (left-aligned) */}
                    <View style={styles.rightColumn}>
                        {firstTwo.map((acc, idx) => (
                            <View style={styles.accessibilityRow} key={idx}>
                                <Ionicons name="arrow-forward-outline" size={18} color="#666"/>
                                <Text style={styles.accessibilityText}>{acc}</Text>
                            </View>
                        ))}
                        {hasMore && (
                            <Text style={styles.moreAccess}>...</Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // ------------------------------
    // Return the full component
    // ------------------------------
    return (
        <SafeAreaProvider>
            {/* ---------- Header Section ---------- */}
            <View style={container.loggedInHeader}>
                <TouchableOpacity
                    onPress={() => router.push("/profile")}
                    style={image.loggedInHeaderIcon}
                >
                    <Ionicons name="person-circle-outline" size={40} color="#333"/>
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
                    <Ionicons name="newspaper-outline" size={30} color="#333"/>
                </TouchableOpacity>
            </View>

            {/* ---------- Main Container ---------- */}
            <View style={styles.container}>
                <Text style={styles.header}>My Properties</Text>

                {loading ? (
                    <Text>Loading...</Text>
                ) : (
                    <ScrollView contentContainerStyle={styles.propertyList}>
                        {properties.map((property) => renderCard(property))}

                        {/* Button to add a new property */}
                        <TouchableOpacity style={styles.addButton} onPress={handleAddProperty}>
                            <Text style={styles.addButtonText}>Add a Property Listing</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </View>

            {/* ---------- Bottom Navigation ---------- */}
            <View style={container.navBar}>
                <TouchableOpacity
                    style={[
                        container.navBarItem,
                        segments[1] === "properties" && container.activeNavBarItem,
                    ]}
                    onPress={() => router.push("/(main)/properties")}
                >
                    <Ionicons
                        name="home"
                        size={24}
                        color={segments[1] === "properties" ? "#007BFF" : "#666"}
                    />
                    <Text style={text.navBar}>Properties</Text>
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
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    propertyList: {
        marginBottom: 20,
    },

    card: {
        backgroundColor: "white",
        borderRadius: 10,
        marginBottom: 20,
        padding: 15,
        // Shadow for Android
        elevation: 5,
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    propertyImage: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },

    // Two columns for details + access
    cardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    leftColumn: {
        flex: 2,
        paddingRight: 10,
    },
    rightColumn: {
        flex: 1,
        // Align text to the left
        alignItems: "flex-start",
        justifyContent: "center",
    },

    // Basic property info
    propertyName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    propertyRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    propertyText: {
        marginLeft: 5,
        fontSize: 16,
    },

    // Accessibilities
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

    // Add button
    addButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 10,
        marginBottom: 50,
    },
    addButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
    },
});
