import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { styles1 } from "../styles";
import {Text} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function VoucherView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles1.container}>
        <SafeAreaView style={styles1.innerContainer}>
          <ThemedText type="title">Voucher information</ThemedText>

          <Text style={styles1.link}>Input voucher information here</Text>

          <Link style={styles1.link} href="/(main)/profile">
            Go to profile
          </Link>

        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}