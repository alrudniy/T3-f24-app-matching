import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, Modal, Button, Alert } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { general, button, image, container, text } from "./styles";
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
  if (cleaned.length !== 10) return phone;
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
  const segments = useSegments();

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

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/logout", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert("Logged Out", "You have been logged out successfully.");
        router.push("/");
      } else {
        Alert.alert("Error", data.message || "Failed to log out.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "An error occurred while logging out.");
    }
  };

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

      {/* Profile Content */}
      <SafeAreaView style={container.profile}>
        <View style={{ marginTop: 20 }} />
        <View style={container.image}>
          <TouchableOpacity onPress={editing ? pickImage : undefined} activeOpacity={editing ? 0.7 : 1}>
            <Image
              source={{ uri: selectedImage || user.profilePicture || "https://via.placeholder.com/150" }}
              style={container.profile}
            />
            {editing && (
              <View style={container.editOverlay}>
                <Ionicons name="camera" size={30} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>
        {editing ? (
          <View style={container.profileDetails}>
            {/* Editable Profile Fields */}
            <Text style={text.profileLabel}>First Name</Text>
            <TextInput
              style={container.input}
              value={user.firstName}
              onChangeText={(text) => setUser({ ...user, firstName: text })}
            />
            <Text style={text.profileLabel}>Last Name</Text>
            <TextInput
              style={container.input}
              value={user.lastName}
              onChangeText={(text) => setUser({ ...user, lastName: text })}
            />
            <Text style={text.profileLabel}>Email</Text>
            <TextInput
              style={container.input}
              value={user.email}
              onChangeText={(text) => setUser({ ...user, email: text })}
            />
            <Text style={text.profileLabel}>Phone</Text>
            <TextInput
              style={container.input}
              value={user.phone}
              onChangeText={(text) => setUser({ ...user, phone: text })}
              keyboardType="phone-pad"
            />
            {user.role === "landlord" && (
              <>
                <Text style={text.profileLabel}>Business Name</Text>
                <TextInput
                  style={container.input}
                  value={user.businessName}
                  onChangeText={(text) => setUser({ ...user, businessName: text })}
                />
              </>
            )}
            <View style={container.profileActions}>
              <TouchableOpacity style={button.save} onPress={handleSave}>
                <Text style={button.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={button.cancel} onPress={handleCancel}>
                <Text style={button.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={container.profileDetails}>
            {/* Static Profile Details */}
            <Text style={text.profileLabel}>First Name</Text>
            <Text style={text.profileValue}>{user.firstName}</Text>
            <Text style={text.profileLabel}>Last Name</Text>
            <Text style={text.profileValue}>{user.lastName}</Text>
            <Text style={text.profileLabel}>Email</Text>
            <Text style={text.profileValue}>{user.email}</Text>
            <Text style={text.profileLabel}>Phone</Text>
            <Text style={text.profileValue}>{formatPhoneNumber(user.phone)}</Text>
            {user.role === "landlord" && (
              <>
                <Text style={text.profileLabel}>Business Name</Text>
                <Text style={text.profileValue}>{user.businessName}</Text>
              </>
            )}
            <TouchableOpacity style={button.base} onPress={() => setEditing(true)}>
              <Text style={button.baseText}>Edit Profile</Text>
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
          <View style={container.modal}>
            <View style={container.modalContent}>
              <Text style={text.modal}>{modalMessage}</Text>
              <Button title="Close" onPress={() => setModalVisible(false)} color="#6200ee" />
            </View>
          </View>
        </Modal>

        {/* Logout Button */}
        <TouchableOpacity style={button.logout} onPress={handleLogout}>
          <Text style={button.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Navigation */}
      <View style={container.navBar}>
        <TouchableOpacity
          style={[container.navBarItem, segments[0] === "matching" && container.activeNavBarItem]}
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
          style={[container.navBarItem, segments[0] === "matchingHistory" && container.activeNavBarItem]}
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
};

export default Profile;
