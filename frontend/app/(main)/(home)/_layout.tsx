import { Stack } from "expo-router";
import "react-native-reanimated";

//(home)'s layout; index is the first page, followed by "options" (don't know how that works)
export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerTitle: "Home", headerShown: false }}
      />
      <Stack.Screen 
        name="options"
        options={{ headerTitle: "Options", presentation: "modal" }}
      />
      <Stack.Screen name="details" options={{ headerTitle: "Details" }} />
    </Stack>
  );
}