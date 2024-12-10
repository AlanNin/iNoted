import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import useColorScheme from "@/hooks/useColorScheme";
import "react-native-reanimated";
import "react-native-gesture-handler";
import ReactQueryProvider from "@/providers/react_query";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { db_client, expo_db } from "@/db/client";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";
import colors from "@/constants/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const theme = useColorScheme();

  const [fontsLoaded, fontsError] = useFonts({
    "Geist-Regular": require("@/assets/fonts/Geist-Regular.otf"),
    "Geist-SemiBold": require("@/assets/fonts/Geist-SemiBold.otf"),
  });

  useDrizzleStudio(expo_db);

  const { success } = useMigrations(db_client, migrations);

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if ((!fontsLoaded && !fontsError) || !success) {
    return null;
  }

  return (
    <ReactQueryProvider>
      <SafeAreaProvider>
        <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: colors[theme].background }}
          >
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)" options={{ headerShown: false }} />
            </Stack>
          </SafeAreaView>
        </ThemeProvider>
      </SafeAreaProvider>
    </ReactQueryProvider>
  );
}
