import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { styles1 } from "./styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function AccountSelectionView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles1.container}>
        <SafeAreaView style={styles1.innerContainer}>
          <ThemedText type="title">Select an account type</ThemedText>

          <Link style={styles1.link} href="/(main)/(home)/accountCreation">
            Create tenant account
          </Link>

          <Link style={styles1.link} href="/(main)/(home)/accountCreation">
            Create home owner account
          </Link>

        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}