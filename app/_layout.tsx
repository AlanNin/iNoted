import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useColorScheme } from "@/hooks/useColorScheme";
import "react-native-reanimated";
import "react-native-gesture-handler";
import ReactQueryProvider from "@/providers/react_query";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { db_client, expo_db } from "@/db/client";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import {
  setStatusBarTranslucent,
  setStatusBarBackgroundColor,
  setStatusBarHidden,
  setStatusBarStyle,
  StatusBar,
} from "expo-status-bar";
import {
  setButtonStyleAsync,
  setBackgroundColorAsync,
} from "expo-navigation-bar";
import migrations from "@/drizzle/migrations";
import colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // * Edge to edge

  setBackgroundColorAsync(
    colorScheme === "light" ? colors.light.background : colors.dark.background
  );

  setButtonStyleAsync(colorScheme === "light" ? "dark" : "light");

  setStatusBarTranslucent(false);

  setStatusBarBackgroundColor(
    colorScheme === "light" ? colors.light.background : colors.dark.background
  );

  setStatusBarStyle(colorScheme === "light" ? "dark" : "light");

  setStatusBarHidden(false);

  // *

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
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(screens)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
