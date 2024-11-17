import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
// 👇
import { Platform } from "react-native";
import {
  lightColors,
  createTheme,
  ThemeProvider as RNEThemeProvider,
} from "@rneui/themed";
// ☝️
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// 👇
const theme = createTheme({
  lightColors: {
    ...Platform.select({
      default: lightColors.platform.android,
      ios: lightColors.platform.ios,
    }),
  },
});
// ☝️

//all fonts imported, hopefully everything works just fine - jeff
export default function RootLayout() {
  //const colorScheme = useColorScheme();
  const colorScheme = "light";
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Roboto-Thin": require("../assets/fonts/Roboto-Thin.ttf"),
    "Roboto-Light": require("../assets/fonts/Roboto-Light.ttf"),
    "Roboto-Regular": require("../assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Medium": require("../assets/fonts/Roboto-Medium.ttf"),
    "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"),
    "Roboto-Black": require("../assets/fonts/Roboto-Black.ttf"),
    "Poppings-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "Poppings-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppings-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppings-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppings-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppings-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppings-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppings-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppings-Black": require("../assets/fonts/Poppins-Black.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  /*since the directory (login) doesn't actually contain anything inside of it (one page in
  the layout's stack is missing, and the other one doesn't appear to contain anything, although I
  could be wrong) it defaults to (main)'s layout (which contains a drawer leading to (home)'s stack, and
  the other "tab" is just the settings page)
  */
  return ( 
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <RNEThemeProvider theme={theme}>
        <Stack>
          <Stack.Screen name="(login)" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </RNEThemeProvider>
    </ThemeProvider>
  );
}