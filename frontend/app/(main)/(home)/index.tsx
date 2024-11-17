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

export default function HomeView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          <ThemedText style={styles.container} type="title">Login page</ThemedText>

          <LoginField/>
          
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

function LoginField(){
  const [username, onChangeLoginText] = React.useState('username');
  const [password, onChangePass] = React.useState('password');

  return (//the holy grail of css styling works!
    <View className="color-red-600: flex-grow:"> 
      <Text className="font-popmed: text-2xl">LOGIN</Text>
      <TextInput 
      value={username}
      style={mainstyles.text_input_default}
      onChangeText={onChangeLoginText}/>
      <TextInput
      value={password}
      style={mainstyles.text_input_default}
      onChangeText={onChangePass}/>
    </View>
  );
}