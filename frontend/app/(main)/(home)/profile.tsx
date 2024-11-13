import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { styles1 } from "../styles";
import {Text} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ProfileView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles1.container}>
        <SafeAreaView style={styles1.innerContainer}>
          <ThemedText type="title">Profile</ThemedText>

          <Text>Profile information here</Text>

          <Link style={styles1.link} href="/(main)/(home)/matching">
            Go to matching
          </Link>

          <Link style={styles1.link} href="/(main)/(home)/matchingHistory">
            Go to match history
          </Link>

        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}