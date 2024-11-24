import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, Alert } from "react-native";
import { styles } from "./styles";
import * as ImagePicker from "expo-image-picker";

// Define the shape of the user data
type UserProfile = {
  profilePicture: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  businessName: string;
};

const profile = () => {
  const [user, setUser] = useState<UserProfile>({
    profilePicture: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    businessName: "",
  });
  const [editing, setEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Fix applied

  useEffect(() => {
    // Fetch user data here (replace with your API call)
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const data: { profile: UserProfile } = await response.json();
        setUser(data.profile);
      } catch (error) {
        console.error('Failed to fetch user data', error);
        Alert.alert("Error", "Failed to fetch user data.");
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      // Save updated user data (API call)
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          businessName: user.businessName,
          profilePicture: user.profilePicture, // optional, include if user updated image
        }),
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert("Profile updated successfully!");
      } else {
        Alert.alert("Error", "Failed to update profile.");
      }
    } catch (error) {
      console.error('Failed to update profile', error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setUser((prev) => ({ ...prev, profilePicture: result.assets[0].uri }));
    }
  };

  return (
    <View style={styles.profileContainer}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{ uri: selectedImage || user.profilePicture }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
      {editing ? (
        <View style={styles.profileDetails}>
          <Text style={styles.profileLabel}>First Name</Text>
          <TextInput
            style={styles.input}
            value={user.firstName}
            onChangeText={(text) => setUser({ ...user, firstName: text })}
          />
          <Text style={styles.profileLabel}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={user.lastName}
            onChangeText={(text) => setUser({ ...user, lastName: text })}
          />
          <Text style={styles.profileLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={user.email}
            onChangeText={(text) => setUser({ ...user, email: text })}
          />
          {user.role === "landlord" && (
            <>
              <Text style={styles.profileLabel}>Business Name</Text>
              <TextInput
                style={styles.input}
                value={user.businessName}
                onChangeText={(text) => setUser({ ...user, businessName: text })}
              />
            </>
          )}
          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.profileDetails}>
          <Text style={styles.profileLabel}>First Name</Text>
          <Text style={styles.profileValue}>{user.firstName}</Text>
          <Text style={styles.profileLabel}>Last Name</Text>
          <Text style={styles.profileValue}>{user.lastName}</Text>
          <Text style={styles.profileLabel}>Email</Text>
          <Text style={styles.profileValue}>{user.email}</Text>
          {user.role === "landlord" && (
            <>
              <Text style={styles.profileLabel}>Business Name</Text>
              <Text style={styles.profileValue}>{user.businessName}</Text>
            </>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default profile;
