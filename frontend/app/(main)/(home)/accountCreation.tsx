import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { Text } from 'react-native';
import { styles1 } from "../styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function AccountCreationView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles1.container}>
        <SafeAreaView style={styles1.innerContainer}>
          <ThemedText type="title">Account creation</ThemedText>

          <Text>Do you have a voucher to input?</Text>

          <Link style={styles1.link} href="/(main)/(home)/voucher">
            Input voucher here
          </Link>

          <Link style={styles1.link} href="/(main)/(home)/profile">
            Go to profile
          </Link>

        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}