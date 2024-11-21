import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { TextInput, Button } from "react-native";
import { styles } from "../styles";

export default function AccountCreationView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.innerContainer, { flex: 1 }]}>
          <ScrollView
            contentContainerStyle={{
              paddingVertical: 20,
              alignItems: "center",
            }}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText type="title" style={{ marginBottom: 20 }}>
              Create Account
            </ThemedText>

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
