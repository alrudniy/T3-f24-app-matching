import { Stack } from "expo-router";
import {client} from "@/client/client.gen";


client.setConfig({
    mode: "cors",
    credentials: "include",
})

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Disable headers globally
      }}
    />
  );
}
