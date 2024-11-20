import { lightColors } from "@rneui/base";
import { setBackgroundColorAsync } from "expo-system-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      color: "#ff0000",
    },
    innerContainer: {
      flex: 1,
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: "lightcyan",
      lineHeight: 30,
      fontSize: 16,
    },
    link: {
      lineHeight: 30,
      fontSize: 16,
    },
    Text: {
        color: "#ff0000",
    },
});

export const styles1 = StyleSheet.create({
    container: {
      flex: 1,
    },
    innerContainer: {
      flex: 1,
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: "lightblue",
      lineHeight: 30,
      fontSize: 16,
    },
    link: {
      lineHeight: 30,
      fontSize: 16,
    },
});