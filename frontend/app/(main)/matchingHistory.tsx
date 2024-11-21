import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { styles } from "./styles";
import {Text} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function MatchingHistoryView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          <ThemedText type="title">Matching history</ThemedText>

          <Text style={styles.link}>Matching history information here</Text>

        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}