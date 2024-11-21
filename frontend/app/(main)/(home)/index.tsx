import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { styles } from "./styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
//import { View } from "react-native-reanimated/lib/typescript/Animated";
import { TextInput } from "react-native-gesture-handler";
import React from 'react';
import {Text, View} from 'react-native';
import { mainstyles } from "./TagStyles";
import LoginLayout from "@/app/(login)/_layout";
import "../../../assets/global.css";
import { LoginField, LogoContainer } from "@/components/page_components/indexMainMenu";
import images from '../../../constants/images';

export default function HomeView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          <ThemedText style={styles.container} className={"font-nunreg text-2xl"} type="title">Login page</ThemedText>

          

          <Link style={styles.link} href="/(main)/(home)/matching">
            Go to matching app
          </Link>

          

          <Link style={styles.link} href="/(main)/(home)/accountSelection">
            Go to account selection
          </Link>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}

//jeff
//I don't like these "custom" tags - for pages, I'd like to simply use react/html tags for building
//pages and then simply inject custom values into each one's style attribute

//*reminder: create a class that will hold "styled" react elements, where you can choose which
//style will apply to which element based on a value (the styles themselves could be in another file, where
//they will be imported to be used) 