import { router, Tabs, usePathname } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Pressable, Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function MainLayout() {
  const colorScheme = useColorScheme();
  // const colorScheme = "light";
  
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (Platform.OS === "android") {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer>
          <Drawer.Screen
            name="(home)"
            options={{
              drawerLabel: "Login",
              title: "Login",
              headerShown: isHome,
            }}
          />
          <Drawer.Screen
            name="profile"
            options={{
              drawerLabel: "Profile",
              title: "Profile",
              headerRight: () => (
                <Pressable
                  style={styles.headerButton}
                  onPress={() => {
                    // In the real world, you should use a logout function here
                    // and then auto redirect using the root layout
                    router.replace("(login)");
                  }}
                >
                  <TabBarIcon name="log-out-outline" />
                </Pressable>
              ),
            }}
          />
          <Drawer.Screen
            name="matching"
            options={{
              drawerLabel: "Matching",
              title: "Matching",
              headerRight: () => (
                <Pressable
                  style={styles.headerButton}
                  onPress={() => {
                    // In the real world, you should use a logout function here
                    // and then auto redirect using the root layout
                    router.replace("(login)");
                  }}
                >
                  <TabBarIcon name="log-out-outline" />
                </Pressable>
              ),
            }}
          />
          <Drawer.Screen
            name="matchingHistory"
            options={{
              drawerLabel: "MatchingHistory",
              title: "MatchingHistory",
              headerRight: () => (
                <Pressable
                  style={styles.headerButton}
                  onPress={() => {
                    // In the real world, you should use a logout function here
                    // and then auto redirect using the root layout
                    router.replace("(login)");
                  }}
                >
                  <TabBarIcon name="log-out-outline" />
                </Pressable>
              ),
            }}
          />
          <Drawer.Screen
            name="settings"
            options={{
              drawerLabel: "Settings",
              title: "Settings",
              headerRight: () => (
                <Pressable
                  style={styles.headerButton}
                  onPress={() => {
                    // In the real world, you should use a logout function here
                    // and then auto redirect using the root layout
                    router.replace("(login)");
                  }}
                >
                  <TabBarIcon name="log-out-outline" />
                </Pressable>
              ),
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Login",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="matching"
        options={{
          title: "Matching",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="matchingHistory"
        options={{
          title: "MatchingHistory",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "cog" : "cog-outline"} color={color} />
          ),
          headerLeft: () => (
            <Pressable
              style={styles.headerButton}
              onPress={() => {
                // In the real world, you should use a logout function here
                // and then auto redirect using the root layout
                router.replace("(login)");
              }}
            >
              <TabBarIcon name="log-out-outline" />
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 16,
  },
});