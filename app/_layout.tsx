import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SheetProvider } from "react-native-actions-sheet";
import { Toasts } from "@backpackapp-io/react-native-toast";
import useAppConfig from "@/hooks/useAppConfig";
import { setStatusBarStyle } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 250,
  fade: true,
});

export default function RootLayout() {
  const theme = useColorScheme();

  const [fontsLoaded, fontsError] = useFonts({
    "Geist-Regular": require("@/assets/fonts/Geist-Regular.otf"),
    "Geist-SemiBold": require("@/assets/fonts/Geist-SemiBold.otf"),
  });
  const { success } = useMigrations(db_client, migrations);
  const [isFirstAppLaunch] = useAppConfig<boolean>("isFirstAppLaunch", true);

  setStatusBarStyle(theme === "light" ? "dark" : "light");
  useDrizzleStudio(expo_db);

  React.useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (
    (!fontsLoaded && !fontsError) ||
    !success ||
    isFirstAppLaunch === undefined
  ) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <ReactQueryProvider>
          <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
            <SafeAreaView
              style={{ flex: 1, backgroundColor: colors[theme].background }}
            >
              <SheetProvider context="global">
                <Stack>
                  <Stack.Screen
                    name="index"
                    options={{ headerShown: false }}
                    redirect={!isFirstAppLaunch}
                  />
                  <Stack.Screen
                    name="(screens)"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </SheetProvider>
            </SafeAreaView>
          </ThemeProvider>
        </ReactQueryProvider>
        <Toasts
          overrideDarkMode={theme !== "dark"}
          defaultStyle={{
            indicator: { backgroundColor: colors[theme].primary },
          }}
        />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
