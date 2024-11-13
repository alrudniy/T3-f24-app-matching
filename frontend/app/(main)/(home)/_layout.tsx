import { Stack } from "expo-router";
import "react-native-reanimated";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerTitle: "Home", headerShown: false }}
      />
      <Stack.Screen
        name="matching"
        options={{ headerTitle: "Matching", presentation: "modal", headerShown: true }}
      />
      <Stack.Screen name="details" options={{ headerTitle: "Details" }} />
    </Stack>
  );
}