import React, { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  TextInput,
  Button,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter, useSegments } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; 
import { general, button, image, container, text } from "../styles";

export default function Voucher() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const router = useRouter();
  const segments = useSegments();

  const [form, setForm] = useState({
    expireDate: "",
    priceLimit: "",
    housingType: "",
    familyMembers: 0,
  });

  const [vouchers, setVouchers] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const expireRegex = /^[0-9]{8}$/; 
  const priceRegex = /^[0-9]+$/; 

  const handleChange = (name: string, value: string | number) => {
    setForm({ ...form, [name]: value });
  };

  const fetchVouchers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/voucher/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setVouchers(data.vouchers);
      } else {
        console.error("Failed to fetch vouchers:", data.message);
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    }
  };

  const handleDelete = async (voucherId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/voucher/delete/${voucherId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Voucher deleted successfully");
        fetchVouchers(); 
      } else {
        Alert.alert("Error", data.message || "Failed to delete voucher");
      }
    } catch (error) {
      console.error("Error deleting voucher:", error);
      Alert.alert("Error", "An error occurred while deleting the voucher.");
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleSubmit = async () => {
    const { expireDate, priceLimit, housingType, familyMembers } = form;

    if (!expireDate || !priceLimit || !housingType || familyMembers <= 0) {
      const missingFields = [];
      if (!expireDate) missingFields.push("Expire Date");
      if (!priceLimit) missingFields.push("Price Limit");
      if (!housingType) missingFields.push("Housing Type");
      if (familyMembers <= 0) missingFields.push("Family Members");
      setErrorMessage(`Missing fields: ${missingFields.join(", ")}`);
      setErrorModalVisible(true);
      return;
    }

    if (!expireRegex.test(expireDate)) {
      setErrorMessage("Please enter a valid expiration date in YYYYMMDD format.");
      setErrorModalVisible(true);
      return;
    }

    if (!priceRegex.test(priceLimit)) {
      setErrorMessage("Please enter a valid price limit (numeric values only).");
      setErrorModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/voucher/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expiration_date: expireDate,
          price_limit: priceLimit,
          housing_type: housingType,
          family_members: familyMembers,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        fetchVouchers(); 
        setForm({ expireDate: "", priceLimit: "", housingType: "", familyMembers: 0 });
      } else {
        setErrorMessage(data.message || "Voucher creation failed.");
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error("Error during voucher creation:", error);
      setErrorMessage("An error occurred. Please try again.");
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Populate the form with voucher details for editing
  const handleEdit = (voucher: any) => {
    setForm({
      expireDate: voucher.expiration_date,
      priceLimit: voucher.price_limit,
      housingType: voucher.housing_type,
      familyMembers: voucher.family_members,
    });
  };

  return (
    <SafeAreaProvider>
      <View style={container.loggedInHeader}>
        <TouchableOpacity onPress={() => router.push("/profile")} style={image.loggedInHeaderIcon}>
          <Ionicons name="person-circle-outline" size={40} color="#333" />
        </TouchableOpacity>

        <Image source={require("./assets/images/icon_logo.png")} style={image.loggedInLogo} resizeMode="contain" />

        <TouchableOpacity onPress={() => router.push("/voucher")} style={image.loggedInHeaderIcon}>
          <Ionicons name="newspaper-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      <ThemedView style={container.base}>
        <SafeAreaView style={[container.inner, { flex: 1, maxWidth: "100%" }]}>
          <ScrollView contentContainerStyle={{ paddingVertical: 20, alignItems: "center" }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Input Voucher</Text>

            <View style={container.form}>
              <TextInput placeholder="Expiration Date (YYYYMMDD)" style={container.input} value={form.expireDate} onChangeText={(text) => handleChange("expireDate", text)} keyboardType="number-pad" />

              <TextInput placeholder="Price Limit" style={container.input} value={form.priceLimit} onChangeText={(text) => handleChange("priceLimit", text)} keyboardType="number-pad" />

              <View style={container.dropdown}>
                <Text style={text.dropdown}>Housing Type:</Text>
                <Picker selectedValue={form.housingType} onValueChange={(itemValue) => handleChange("housingType", itemValue)} style={{ flex: 1, marginLeft: 10 }}>
                  <Picker.Item label="Select Housing Type" value="" />
                  <Picker.Item label="Apartment" value="apartment" />
                  <Picker.Item label="House" value="house" />
                  <Picker.Item label="Shelter" value="shelter" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>

              <View style={container.familyMembers}>
                <Text style={text.familyMembersLabel}>Family Members:</Text>
                <View style={container.familyButtons}>
                  <TouchableOpacity style={button.family} onPress={() => handleChange("familyMembers", Math.max(form.familyMembers - 1, 0))}>
                    <Text style={button.familyText}>-</Text>
                  </TouchableOpacity>
                  <Text>{form.familyMembers}</Text>
                  <TouchableOpacity style={button.family} onPress={() => handleChange("familyMembers", form.familyMembers + 1)}>
                    <Text style={button.familyText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Button title="Submit Voucher" onPress={handleSubmit} color="#4CAF50" />
            </View>

            {loading && <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />}

            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>Your Vouchers</Text>
              {vouchers.length === 0 ? (
                <Text>No vouchers found.</Text>
              ) : (
                vouchers.map((voucher) => (
                  <View key={voucher.id} style={[container.form, {marginVertical: "5px"}]}>
                    <Text>Expiration: {voucher.expiration_date}</Text>
                    <Text>Price Limit: {voucher.price_limit}</Text>
                    <Text>Housing Type: {voucher.housing_type}</Text>
                    <Text>Family Members: {voucher.family_members}</Text>
                    <TouchableOpacity onPress={() => handleDelete(voucher.id)} style={{ backgroundColor: 'red', padding: 10, borderRadius: 5 }}>
                      <Text style={{ color: 'white' }}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleEdit(voucher)} style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5, marginTop: 5 }}>
                      <Text style={{ color: 'white' }}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
