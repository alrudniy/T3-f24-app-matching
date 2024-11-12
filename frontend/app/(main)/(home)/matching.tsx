import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { styles1 } from "./styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function MatchingView() {
  return (
    <SafeAreaProvider>
      <ThemedView style={styles1.container}>
        <SafeAreaView style={styles1.innerContainer}>
          <ThemedText type="title">Matching app</ThemedText>

          <Link style={styles1.link} href="/(main)/(home)/matchingHistory">
            Go to matching history
          </Link>

          <Link style={styles1.link} href="/(main)/(home)/profile">
            Go to profile
          </Link>

        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}

//for page-specific body values/tags we can set them all as page variables (some of them collections of values either in arrays/maps) 
//so that they can be referenced by whatever element/tag needs them in each page's default function, or for values that will be
//referenced in many pages we can have said values in a "centralized" file whose value variables can be imported
//by whatever page's tags that need them (very complicated to explain, but it's a thought)
