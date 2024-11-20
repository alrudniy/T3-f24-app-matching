import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { styles } from "../styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function HomeView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          <ThemedText type="title">Login page</ThemedText>
          <Link style={styles.link} href="/(main)/(home)/accountSelection">
            Go to account selection
          </Link>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}