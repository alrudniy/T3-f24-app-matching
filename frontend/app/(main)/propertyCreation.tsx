import React, {useEffect, useState} from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {useRouter, useSegments} from "expo-router";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";

import {button, container, general, image, text} from "./styles";
import {propertiesPropertyCreatePost} from "@/client";

interface CurrentUser {
    id: number;
    username: string;
    email?: string;
}

interface Accessibility {
    id: number;
    type: string;
}

export default function PropertyCreation() {
    const router = useRouter();
    const segments = useSegments();

    // Current User
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    // Form Data (added "description")
    const [form, setForm] = useState({
        name: "",
        street: "",
        city: "",
        description: "", // ← NEW field for description
        size: "",
        value: "",
        bedrooms: "",
        bathrooms: "",
    });

    // Images
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Accessibilities
    const [accessibilities, setAccessibilities] = useState<Accessibility[]>([]);
    const [selectedAccessibilities, setSelectedAccessibilities] = useState<number[]>([]);

    useEffect(() => {
        fetchCurrentUser();
        fetchAccessibilities();
    }, []);

    // 1) Fetch current user
    const fetchCurrentUser = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/current-user", {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
            });
            const data = await response.json();
            if (data.success) {
                setCurrentUser(data.user);
            } else {
                Alert.alert("Error", data.message || "Failed to load user data.");
            }
        } catch (error) {
            console.error("Error fetching current user:", error);
            Alert.alert("Error", "Could not load user. Please try again.");
        }
    };

    // 2) Fetch accessibilities
    const fetchAccessibilities = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/accessibilities", {
                credentials: "include",
            });
            const data = await response.json();

            if (data.success) {
                setAccessibilities(data.accessibilities);
            } else {
                console.error("Failed to fetch accessibilities:", data.message);
            }
        } catch (error) {
            console.error("Error fetching accessibilities:", error);
        }
    };

    // Handle form inputs
    const handleInputChange = (field: string, value: string) => {
        setForm((prev) => ({...prev, [field]: value}));
    };

    // Use old MediaTypeOptions to avoid type errors
    const handleImageUpload = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                const picked = result.assets[0];
                console.log("Picked image:", picked.uri);

                const filename = picked.uri.split("/").pop();
                const extension = picked.uri.split(".").pop();
                const type = `image/${extension}`;

                setImages((prev) => [
                    ...prev,
                    {uri: picked.uri, name: filename, type},
                ]);
            }
        } catch (error) {
            console.error("Image upload error:", error);
            Alert.alert("Error", "An error occurred while selecting the image.");
        }
    };

    const handleToggleAccessibility = (id: number) => {
        setSelectedAccessibilities((prev) =>
            prev.includes(id) ? prev.filter((accId) => accId !== id) : [...prev, id]
        );
    };

    // Step One: Create property (no images)
    const createProperty = async (): Promise<number | null> => {
        try {
            if (!currentUser?.id) {
                Alert.alert("Error", "No user ID found. Please log in.");
                return null;
            }

            setLoading(true);

            const {data, error} = await propertiesPropertyCreatePost({
                body: {
                    name: form.name,
                    street_address: form.street,
                    city: form.city,
                    description: form.description,
                    size_sqft: form.size,
                    price: form.value,
                    bedrooms: form.bedrooms,
                    bathrooms: form.bathrooms,
                },
            })


            if (data) {
                return data.property_id
            } else {
                Alert.alert("Error", error?.message || "Property creation failed.");
                return null
            }
        } catch (error) {
            console.error("Error creating property:", error);
            Alert.alert("Error", "An error occurred. Please try again.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Step Two: Upload images
    const uploadImages = async (propertyId: number) => {
        try {
            if (images.length === 0) {
                console.log("No images to upload.");
                return;
            }

            console.log("Uploading images:", images.length);
            images.forEach((img) =>
                console.log("Name:", img.name, "Type:", img.type, "URI:", img.uri)
            );

            const formData = new FormData();
            images.forEach((img) => {
                formData.append("images", {
                    uri: img.uri,
                    name: img.name,
                    type: img.type,
                } as any);
            });

            setLoading(true);

            const response = await fetch(
                `http://localhost:5000/property/${propertyId}/upload-images`,
                {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                }
            );
            const data = await response.json();

            if (!response.ok || !data.success) {
                Alert.alert("Warning", data.message || "Images upload failed.");
            } else {
                console.log("Images uploaded successfully:", data.images);
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            Alert.alert("Warning", "Property created, but images upload failed.");
        } finally {
            setLoading(false);
        }
    };

    // Step Three: Add Accessibilities
    const addAccessibilities = async (propertyId: number) => {
        try {
            if (selectedAccessibilities.length === 0) return;

            setLoading(true);

            const response = await fetch(
                `http://localhost:5000/property/${propertyId}/add-accessibility`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify({
                        accessibility_ids: selectedAccessibilities,
                    }),
                }
            );
            const data = await response.json();

            if (!response.ok || !data.success) {
                Alert.alert(
                    "Warning",
                    data.message || "Property created, but adding accessibilities failed."
                );
            } else {
                console.log("Accessibilities added:", selectedAccessibilities);
            }
        } catch (error) {
            console.error("Error adding accessibilities:", error);
            Alert.alert("Warning", "Property created, but adding accessibilities failed.");
        } finally {
            setLoading(false);
        }
    };

    // Combined flow
    const handleSubmit = async () => {
        const propertyId = await createProperty();
        if (!propertyId) return;

        await uploadImages(propertyId);
        await addAccessibilities(propertyId);

        Alert.alert("Success", "Property created successfully!");
        router.push("/(main)/properties");
    };

    return (
        <SafeAreaProvider>
            {/* Header */}
            <View style={container.loggedInHeader}>
                <TouchableOpacity onPress={() => router.push("/profile")} style={image.loggedInHeaderIcon}>
                    <Ionicons name="person-circle-outline" size={40} color="#333"/>
                </TouchableOpacity>

                <Image
                    source={require("./(home)/assets/images/icon_logo.png")}
                    style={image.loggedInLogo}
                    resizeMode="contain"
                />

                <TouchableOpacity onPress={() => router.push("/voucher")} style={image.loggedInHeaderIcon}>
                    <Ionicons name="newspaper-outline" size={30} color="#333"/>
                </TouchableOpacity>
            </View>

            <SafeAreaView style={container.base}>
                <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 100}}>
                    <Text style={text.title}>Add a Property</Text>

                    {/* General Information */}
                    <Text style={text.sectionHeader}>General Information</Text>
                    <TextInput
                        placeholder="Name"
                        style={container.input}
                        value={form.name}
                        onChangeText={(txt) => handleInputChange("name", txt)}
                    />
                    <TextInput
                        placeholder="Property Address"
                        style={container.input}
                        value={form.street}
                        onChangeText={(txt) => handleInputChange("street", txt)}
                    />
                    <TextInput
                        placeholder="City"
                        style={container.input}
                        value={form.city}
                        onChangeText={(txt) => handleInputChange("city", txt)}
                    />

                    {/*Description Input */}
                    <TextInput
                        placeholder="Description"
                        style={[container.input, styles.multilineInput]}
                        value={form.description}
                        onChangeText={(txt) => handleInputChange("description", txt)}
                        multiline
                        numberOfLines={4}
                    />

                    {/* Property Details */}
                    <Text style={text.sectionHeader}>Details</Text>
                    <View style={container.row}>
                        <TextInput
                            placeholder="Size"
                            style={[container.input, general.halfWidth]}
                            value={form.size}
                            onChangeText={(txt) => handleInputChange("size", txt)}
                        />
                        <TextInput
                            placeholder="Price"
                            style={[container.input, general.halfWidth]}
                            value={form.value}
                            onChangeText={(txt) => handleInputChange("value", txt)}
                        />
                    </View>

                    {/* Rooms Section */}
                    <Text style={text.sectionHeader}>Rooms</Text>
                    <View style={container.row}>
                        <TextInput
                            placeholder="Bedrooms"
                            style={[container.input, general.halfWidth]}
                            value={form.bedrooms}
                            onChangeText={(txt) => handleInputChange("bedrooms", txt)}
                        />
                        <TextInput
                            placeholder="Bathrooms"
                            style={[container.input, general.halfWidth]}
                            value={form.bathrooms}
                            onChangeText={(txt) => handleInputChange("bathrooms", txt)}
                        />
                    </View>

                    {/* Accessibility Section */}
                    <Text style={text.sectionHeader}>Accessibilities</Text>
                    <View style={styles.accessibilityContainer}>
                        {accessibilities.map((acc) => (
                            <TouchableOpacity
                                key={`accessibility-${acc.id}`}
                                style={styles.checkboxRow}
                                onPress={() => handleToggleAccessibility(acc.id)}
                            >
                                <Ionicons
                                    name={
                                        selectedAccessibilities.includes(acc.id)
                                            ? "checkbox-outline"
                                            : "square-outline"
                                    }
                                    size={24}
                                    color={selectedAccessibilities.includes(acc.id) ? "#4CAF50" : "#666"}
                                />
                                <Text style={styles.checkboxLabel}>{acc.type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Image Upload */}
                    <Text style={text.sectionHeader}>Upload Images</Text>
                    <TouchableOpacity style={button.imageUpload} onPress={handleImageUpload}>
                        <Text style={button.imageUploadText}>Select Images</Text>
                    </TouchableOpacity>

                    {/* Submit */}
                    <Button title="Submit" onPress={handleSubmit} color="#4CAF50"/>

                    {loading && (
                        <ActivityIndicator size="large" color="#4CAF50" style={{marginTop: 20}}/>
                    )}
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={container.navBar}>
                    <TouchableOpacity
                        style={[container.navBarItem, segments[1] === "properties" && container.activeNavBarItem]}
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
                        style={[container.navBarItem, segments[0] === "landlordMatchingHistory" && container.activeNavBarItem]}
                        onPress={() => router.push("/(main)/landlordMatchingHistory")}
                    >
                        <Ionicons
                            name="heart-outline"
                            size={24}
                            color={segments[0] === "landlordMatchingHistory" ? "#007BFF" : "#666"}
                        />
                        <Text style={[text.navBar, segments[0] === "landlordMatchingHistory" && text.activeNavBar]}>
                            Matches
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    multilineInput: {
        height: 100,
        textAlignVertical: "top",
        padding: 10,
    },
    accessibilityContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        marginBottom: 20,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "45%",
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 16,
        flexShrink: 1,
    },
});
