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
        name="accountSelection"
        options={{ headerTitle: "AccountSelection", presentation: "modal", headerShown: true }}
      />
      <Stack.Screen
        name="accountCreation"
        options={{ headerTitle: "AccountCreation", presentation: "modal", headerShown: true }}
      />
      <Stack.Screen
        name="voucher"
        options={{ headerTitle: "Voucher", presentation: "modal", headerShown: true }}
      />
    </Stack>
  );
}