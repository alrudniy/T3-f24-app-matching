import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { Text, Button, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

export default function VoucherView() {
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
            {/* Header */}
            {/* <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>LOGO</Text>
              </View>
            </View> */}

            {/* Title */}
            <Text style={styles.title}>Enter Voucher Information:</Text>

            {/* Form */}
            <View style={styles.formContainer}>
              <TextInput placeholder="Enter Full Legal Name" style={styles.input} />
              <TextInput placeholder="Enter Date of Birth" style={styles.input} />
              <TextInput placeholder="Enter Social Security" style={styles.input} />
              <TextInput placeholder="Enter Phone Number" style={styles.input} />

              {/* Dropdown for Housing Type */}
              <View style={styles.dropdown}>
                <Text style={styles.dropdownText}>Housing Type:</Text>
                <Text style={styles.dropdownValue}>Dropdown ▼</Text>
              </View>

              {/* Family Members */}
              <View style={styles.familyMembersContainer}>
                <Text style={styles.familyMembersLabel}>Family Members:</Text>
                <View style={styles.familyButtons}>
                  <TouchableOpacity style={styles.familyButton}>
                    <Text style={styles.familyButtonText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.familyButton}>
                    <Text style={styles.familyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Income Info Section */}
              <View style={styles.incomeInfo}>
                <Text style={styles.incomeInfoText}>
                  * Employment income (pay stubs, tax returns).{'\n'}
                  * Social Security benefits.{'\n'}
                  * Unemployment benefits.{'\n'}
                  * Child support or alimony.{'\n'}
                  * Other income sources (e.g., pensions, disability).{'\n'}
                  etc.
                </Text>
              </View>

              {/* Verify Identity Button */}
              <TouchableOpacity style={styles.verifyButton}>
                <Text style={styles.verifyButtonText}>Verify Identity</Text>
              </TouchableOpacity>

              {/* Disclaimer */}
              <Text style={styles.disclaimer}>*potential background check here</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
