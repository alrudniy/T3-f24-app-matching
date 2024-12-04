import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, Modal, Button } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import * as ImagePicker from "expo-image-picker";

type UserProfile = {
  profilePicture: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  businessName: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length !== 10) return phone; // Return unformatted if not 10 digits
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
};

const Profile = () => {
  const [user, setUser] = useState<UserProfile>({
    profilePicture: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    businessName: "",
  });
  const [editing, setEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const router = useRouter();

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

        const data = await response.json();
        if (data.success) {
          setUser({
            profilePicture: data.profile.profile_picture || "",
            firstName: data.profile.firstname || "",
            lastName: data.profile.lastname || "",
            email: data.profile.email || "",
            phone: data.profile.phone || "",
            role: data.profile.role || "",
            businessName: data.profile.businessName || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!emailRegex.test(user.email)) {
      showModal("Invalid Email. Please enter a valid email address.");
      return;
    }

    if (!phoneRegex.test(user.phone)) {
      showModal("Invalid Phone. Please enter a valid phone number (10 digits).");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("firstname", user.firstName);
      formData.append("lastname", user.lastName);
      formData.append("email", user.email);
      formData.append("phone", user.phone);

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
        showModal("Profile updated successfully!");
        setEditing(false);
      } else {
        showModal(result.message || "Failed to update profile.");
      }
    } catch (error) {
      showModal("An error occurred while updating your profile.");
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

  const showModal = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  return (
    <SafeAreaProvider>
      {/* Header */}
      <View style={styles.LoggedInHeader}>
        <TouchableOpacity onPress={() => router.push("/profile")} style={styles.LoggedInHeaderIcon}>
          <Ionicons name="person-circle-outline" size={40} color="#333" />
        </TouchableOpacity>

        <Image
          source={require("./(home)/assets/images/icon_logo.png")}
          style={styles.LoggedInLogo}
          resizeMode="contain"
        />

        <TouchableOpacity onPress={() => router.push("/voucher")} style={styles.LoggedInHeaderIcon}>
          <Ionicons name="newspaper-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Profile Content */}
      <View style={styles.profileContainer}>
      <View style={{ marginTop: 20 }} />
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
              onChangeText={(text) => setUser({ ...user, email: text })}
            />
            <Text style={styles.profileLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              value={user.phone}
              onChangeText={(text) => setUser({ ...user, phone: text })}
              keyboardType="phone-pad"
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
            <Text style={styles.profileLabel}>Phone</Text>
            <Text style={styles.profileValue}>{formatPhoneNumber(user.phone)}</Text>
            {user.role === "landlord" && (
              <>
                <Text style={styles.profileLabel}>Business Name</Text>
                <Text style={styles.profileValue}>{user.businessName}</Text>
              </>
            )}
            <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Modal for displaying messages */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <Button title="Close" onPress={() => setModalVisible(false)} color="#6200ee" />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaProvider>
  );
};

export default Profile;
