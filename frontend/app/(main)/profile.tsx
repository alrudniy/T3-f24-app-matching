import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, Alert } from "react-native";
import { styles } from "./styles";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the overlay icon

type UserProfile = {
  profilePicture: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  businessName: string;
};

const Profile = () => {
  const [user, setUser] = useState<UserProfile>({
    profilePicture: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    businessName: "",
  });
  const [editing, setEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
          const profile = data.profile;
          setUser({
            profilePicture: profile.profile_picture || "",
            firstName: profile.firstname || "",
            lastName: profile.lastname || "",
            email: profile.username || "",
            role: profile.role || "",
            businessName: profile.businessName || "",
          });
        } else {
          console.error("Error fetching profile:", data.message);
          Alert.alert("Error", data.message || "Failed to fetch profile.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to fetch user data.");
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("firstname", user.firstName);
      formData.append("lastname", user.lastName);
      if (user.role === "landlord" && user.businessName) {
        formData.append("businessName", user.businessName);
      }

      if (selectedImage) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        formData.append("profile_picture", blob, "profile_picture.jpg");
      }

      const response = await fetch("http://localhost:5000/api/user/update-profile", {
        method: "PUT",
        headers: {
          "Accept": "application/json",
        },
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert("Success", "Profile updated successfully!");
        setEditing(false);
      } else {
        console.error("Error updating profile:", result.message);
        Alert.alert("Error", result.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "An error occurred while updating your profile.");
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setSelectedImage(null);
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
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={editing ? pickImage : undefined} activeOpacity={editing ? 0.7 : 1}>
          <Image
            source={{ uri: selectedImage || user.profilePicture || "https://via.placeholder.com/150" }}
            style={styles.profileImage}
          />
          {editing && (
            <View style={styles.editOverlay}>
              <Ionicons name="camera" size={30} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>
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
            editable={false} // Non-editable field
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

export default Profile;
