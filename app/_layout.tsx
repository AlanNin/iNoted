import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import "react-native-reanimated";
import "react-native-gesture-handler";
import ReactQueryProvider from "@/providers/react_query";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { db_client, expo_db } from "@/db/client";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SheetProvider } from "react-native-actions-sheet";
import { ConfigProvider } from "@/providers/config";
import InitProviders from "@/providers/init_providers";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 250,
  fade: true,
});

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    "Geist-Regular": require("@/assets/fonts/Geist-Regular.otf"),
    "Geist-SemiBold": require("@/assets/fonts/Geist-SemiBold.otf"),
  });
  const { success } = useMigrations(db_client, migrations);

  useDrizzleStudio(expo_db);

  React.useEffect(() => {
    async function prepare() {
      if (fontsLoaded || fontsError) {
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [fontsLoaded, fontsError]);

  if ((!fontsLoaded && !fontsError) || !success) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ConfigProvider>
        <GestureHandlerRootView>
          <ReactQueryProvider>
            <InitProviders>
              <SheetProvider context="global">
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(screens)"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </SheetProvider>
            </InitProviders>
          </ReactQueryProvider>
        </GestureHandlerRootView>
      </ConfigProvider>
    </SafeAreaProvider>
  );
}
