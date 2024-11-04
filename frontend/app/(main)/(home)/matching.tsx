import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { styles1 } from "./styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function MatchingView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles1.container}>
        <SafeAreaView style={styles1.innerContainer}>
          <ThemedText type="title">Matching app</ThemedText>

          <Link style={styles1.link} href="/(main)/(home)/matchingHistory">
            Go to matching history
          </Link>

          <Link style={styles1.link} href="/(main)/(home)/profile">
            Go to profile
          </Link>

        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}