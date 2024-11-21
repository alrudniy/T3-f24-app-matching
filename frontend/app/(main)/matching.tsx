import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { styles } from "./styles";
import {Text} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function MatchingView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          <ThemedText type="title">Matching app</ThemedText>

          <Text style={styles.link}>Matching app here</Text>

        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}