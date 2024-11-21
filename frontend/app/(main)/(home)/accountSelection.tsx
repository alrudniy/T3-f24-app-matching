import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TextInput, TouchableOpacity, Alert } from "react-native";
import { Link } from "expo-router";
import { styles } from "../styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function AccountSelectionView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          <ThemedText style={styles.title} type="title">
            Select an account type
          </ThemedText>

          <ThemedView style={styles.buttonContainer}>
            {/* Tenant Account Button*/}
            <Link href="/(main)/(home)/accountCreation" style={styles.squareButton}>
              <Icon name="account" size={80} color="#fff" />
              <ThemedText style={styles.buttonText}>Tenant</ThemedText>
            </Link>

            {/* Property Owner Button*/}
            <Link href="/(main)/(home)/accountCreation" style={styles.squareButton}>
              <Icon name="home" size={80} color="#fff" />
              <ThemedText style={styles.buttonText}>Property Owner</ThemedText>
            </Link>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}