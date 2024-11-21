import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { styles } from "./styles";
import {Text} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ProfileView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          <ThemedText type="title">Profile</ThemedText>

          <Text style={styles.link}>Profile information here</Text>

        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}