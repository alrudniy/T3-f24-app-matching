import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { Text, Button, TextInput, View, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { styles } from "../styles";

export default function VoucherView() {
  const [housingType, setHousingType] = useState("");
  const [familyMembers, setFamilyMembers] = useState(0);

  const addFamilyMember = () => setFamilyMembers((prev) => prev + 1);
  const removeFamilyMember = () => setFamilyMembers((prev) => (prev > 0 ? prev - 1 : 0));

  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText type="title">Enter Voucher Information</ThemedText>

            <ThemedView style={styles.formContainer}>
              <TextInput
                placeholder="Enter Full Legal Name"
                style={styles.input}
              />
              <TextInput
                placeholder="Enter Date of Birth"
                style={styles.input}
              />
              <TextInput
                placeholder="Enter Social Security Number"
                style={styles.input}
              />
              <TextInput
                placeholder="Enter Phone Number"
                style={styles.input}
              />

              {/* Dropdown for Housing Type */}
              <View style={styles.dropdown}>
                <Text style={styles.dropdownText}>Housing Type:</Text>
                <Picker
                  selectedValue={housingType}
                  onValueChange={(itemValue) => setHousingType(itemValue)}
                  style={{ flex: 1, marginLeft: 10 }}
                >
                  <Picker.Item label="Select Housing Type" value="" />
                  <Picker.Item label="Apartment" value="apartment" />
                  <Picker.Item label="House" value="house" />
                  <Picker.Item label="Shelter" value="shelter" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>

              {/* Family Members Section */}
              <View style={styles.familyMembersContainer}>
                <Text style={styles.familyMembersLabel}>Family Members:</Text>
                <View style={styles.familyButtons}>
                  <TouchableOpacity
                    style={styles.familyButton}
                    onPress={removeFamilyMember}
                  >
                    <Text style={styles.familyButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text>{familyMembers}</Text>
                  <TouchableOpacity
                    style={styles.familyButton}
                    onPress={addFamilyMember}
                  >
                    <Text style={styles.familyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Verify Identity Button */}
              <TouchableOpacity style={styles.verifyButton}>
                <Text style={styles.verifyButtonText}>Verify Identity</Text>
              </TouchableOpacity>
            </ThemedView>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
