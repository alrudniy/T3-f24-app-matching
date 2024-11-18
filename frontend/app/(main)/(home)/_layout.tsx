import { Stack } from "expo-router";
import "react-native-reanimated";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerTitle: "Home", presentation: "modal", headerShown: true }}
      />
      <Stack.Screen
        name="matching"
        options={{ headerTitle: "Matching", presentation: "modal", headerShown: true }}
      />
      <Stack.Screen
        name="profile"
        options={{ headerTitle: "Profile", presentation: "modal", headerShown: true }}
      />
      <Stack.Screen
        name="matchingHistory"
        options={{ headerTitle: "MatchingHistory", presentation: "modal", headerShown: true }}
      />
      <Stack.Screen name="details" options={{ headerTitle: "Details" }} />
    </Stack>
  );
}