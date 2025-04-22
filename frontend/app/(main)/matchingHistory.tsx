import React, {useEffect, useState} from "react";
import {Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";
import {useRouter, useSegments} from "expo-router";

import {container, image, text} from "./styles";
import {matchesApiUserMatchedPropertiesGet, PropertyData} from "@/client";


export default function MatchingHistoryView() {
    const [matchedProperties, setMatchedProperties] = useState<Array<PropertyData>>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        fetchMatchedProperties();
    }, []);

    const fetchMatchedProperties = async () => {
        const {data, error} = await matchesApiUserMatchedPropertiesGet()

        if (data) {
            setMatchedProperties(data.matched_properties)
        } else if (error) {
            Alert.alert("Error", "Could not load matched properties. Please try again.");
        }

        setLoading(false);
    };

    // Render a single matched property card
    const renderCard = (property: PropertyData) => {
        const access = property.accessibilities || [];
        const firstThree = access.slice(0, 3);
        const hasMore = access.length > 3;

        return (
            <TouchableOpacity
                key={property.id}
                style={[container.propertyCard, styles.card]}
                onPress={() =>
                    router.push({
                        pathname: "/(main)/propertyListing",
                        params: {id: property.id.toString()},
                    })
                }
                activeOpacity={0.9}
            >
                {/* Full-width image at the top */}
                <Image
                    source={{uri: property.image_url || "https://via.placeholder.com/150"}}
                    style={styles.propertyImage}
                />

                {/* Title & Subtitle */}
                <View style={styles.titleBox}>
                    <Text style={styles.propertyTitle}>{property.name}</Text>
                    {property.businessName && (
                        <Text style={styles.businessSubtitle}>{property.businessName}</Text>
                    )}
                </View>

                {/* Two-column layout */}
                <View style={styles.cardContent}>
                    {/* Left column: property info */}
                    <View style={styles.leftColumn}>
                        <View style={styles.row}>
                            <Ionicons name="location-outline" size={20} color="#666"/>
                            <Text style={styles.propertyText}>
                                {property.street}, {property.city}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Ionicons name="resize-outline" size={20} color="#666"/>
                            <Text style={styles.propertyText}>{property.size_sqft} sqft</Text>
                        </View>
                        <View style={styles.row}>
                            <Ionicons name="cash-outline" size={20} color="#666"/>
                            <Text style={styles.propertyText}>${property.price.toLocaleString()}</Text>
                        </View>
                        <View style={styles.row}>
                            <Ionicons name="bed-outline" size={20} color="#666"/>
                            <Text style={styles.propertyText}>{property.bedrooms} Beds</Text>
                        </View>
                        <View style={styles.row}>
                            <Ionicons name="water-outline" size={20} color="#666"/>
                            <Text style={styles.propertyText}>{property.bathrooms} Baths</Text>
                        </View>
                    </View>

                    {/* Right column: Accessibilities */}
                    <View style={styles.rightColumn}>
                        {access.length > 0 && (
                            <>
                                <Text style={styles.accHeader}>Accessibilities</Text>
                                {firstThree.map((accItem, i) => (
                                    <View style={styles.accessibilityRow} key={i}>
                                        <Ionicons name="arrow-forward-outline" size={18} color="#666"/>
                                        <Text style={styles.accessibilityText}>{accItem}</Text>
                                    </View>
                                ))}
                                {hasMore && <Text style={styles.moreAccess}>...</Text>}
                            </>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaProvider>
            {/* LoggedInHeader */}
            <View style={container.loggedInHeader}>
                {/* Profile Icon */}
                <TouchableOpacity onPress={() => router.push("/profile")} style={image.loggedInHeaderIcon}>
                    <Ionicons name="person-circle-outline" size={40} color="#333"/>
                </TouchableOpacity>

                {/* Logo */}
                <Image
                    source={require("./(home)/assets/images/icon_logo.png")}
                    style={image.loggedInLogo}
                    resizeMode="contain"
                />

                {/* Paper/Info Icon */}
                <TouchableOpacity onPress={() => router.push("/voucher")} style={image.loggedInHeaderIcon}>
                    <Ionicons name="newspaper-outline" size={30} color="#333"/>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <SafeAreaView style={container.base}>
                {loading ? (
                    <Text style={text.loading}>Loading matched properties...</Text>
                ) : matchedProperties.length > 0 ? (
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        {matchedProperties.map((property) => renderCard(property))}
                    </ScrollView>
                ) : (
                    <Text style={container.noData}>No matched properties found.</Text>
                )}
            </SafeAreaView>

            {/* Bottom Navigation */}
            <View style={container.navBar}>
                <TouchableOpacity
                    style={[
                        container.navBarItem,
                        segments[0] === "matching" && container.activeNavBarItem,
                    ]}
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

// ------------------------------
// Local Styles
// ------------------------------
const {width} = Dimensions.get("window");

const styles = StyleSheet.create({
    scrollContainer: {
        paddingBottom: 20,
    },
    card: {
        width: width * 0.95, // nearly full screen
        alignSelf: "center",
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: "#fff",
        // iOS shadow
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 4,
        // Android elevation
        elevation: 3,
    },
    propertyImage: {
        width: "100%",
        height: 200,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    titleBox: {
        marginTop: 10,
        marginLeft: 15,
        marginBottom: 10,
    },
    propertyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 3,
    },
    businessSubtitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#555",
    },
    cardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        marginBottom: 15,
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
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    propertyText: {
        marginLeft: 5,
        fontSize: 15,
        color: "#333",
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
