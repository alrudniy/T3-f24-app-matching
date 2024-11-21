import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { Text, Button, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

export default function AccountCreationView() {
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
            <ThemedText type="title">Create Account</ThemedText>

            <ThemedView style={styles.formContainer}>
              <TextInput placeholder="First Name" style={styles.input} />
              <TextInput placeholder="Last Name" style={styles.input} />
              <TextInput placeholder="Email" style={styles.input} />
              <TextInput placeholder="Confirm Email" style={styles.input} />
              <TextInput
                placeholder="Password"
                secureTextEntry
                style={styles.input}
              />
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                style={styles.input}
              />
              <TextInput placeholder="Etc." style={styles.input} />
              <Button title="Create Account" onPress={() => {}} color="#4CAF50" />
            </ThemedView>

          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}