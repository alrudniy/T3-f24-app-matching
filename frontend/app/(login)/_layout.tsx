import { Stack } from "expo-router";
import "react-native-reanimated";
import React from 'react';

export default function LoginLayout() {
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
    </Stack>
  );
}