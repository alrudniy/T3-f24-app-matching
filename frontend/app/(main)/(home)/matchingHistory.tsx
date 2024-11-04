import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { styles1 } from "./styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function MatchingHistoryView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles1.container}>
        <SafeAreaView style={styles1.innerContainer}>
          <ThemedText type="title">Matching history</ThemedText>

          <Link style={styles1.link} href="/(main)/(home)/matching">
            Go to matching
          </Link>

          <Link style={styles1.link} href="/(main)/(home)/profile">
            Go to profile
          </Link>

        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}