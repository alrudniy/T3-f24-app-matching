import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { general, button, image, container, text } from "./styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function SettingsView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={container.base}>
        <SafeAreaView style={container.inner}>
          <ThemedText type="title">Settings view</ThemedText>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}