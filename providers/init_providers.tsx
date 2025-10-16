import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import { Toasts } from "@backpackapp-io/react-native-toast";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React from "react";
import { BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConfig } from "./config";
import ExitConfirmationAlert from "@/components/exit_confirmation";
import {
  setStatusBarStyle,
  setStatusBarBackgroundColor,
} from "expo-status-bar";
import { AppState } from "react-native";
import { AppStateStatus } from "react-native";

export default function InitProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // theme
  const theme = useColorScheme();
  const LightThemeCustom = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      text: colors.light.text,
      background: colors.light.background,
      primary: colors.light.primary,
    },
  };
  const DarkThemeCustom = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      text: colors.dark.text,
      background: colors.dark.background,
      primary: colors.dark.primary,
    },
  };

  // exit confirmation
  const navigation = useNavigation();
  const [isExitConfirmationEnabled] = useConfig<boolean>(
    "isExitConfirmationEnabled",
    false
  );
  const [exitConfirmationModalVisible, setExitConfirmationModalVisible] =
    React.useState(false);

  const handleCancelExitConfirmation = () => {
    setExitConfirmationModalVisible(false);
  };

  const handleConfirmExitConfirmation = () => {
    setExitConfirmationModalVisible(false);
    BackHandler.exitApp();
  };

  React.useEffect(() => {
    const handleBackPress = () => {
      if (!navigation.canGoBack() && isExitConfirmationEnabled) {
        setExitConfirmationModalVisible(true);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => subscription.remove();
  }, [navigation, isExitConfirmationEnabled]);

  React.useEffect(() => {
    const changeStatusBarStyle = () => {
      setStatusBarStyle(theme === "light" ? "dark" : "light");
      setStatusBarBackgroundColor(colors[theme].background);
    };

    changeStatusBarStyle();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        changeStatusBarStyle();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [theme]);

  return (
    <ThemeProvider
      value={theme === "dark" ? DarkThemeCustom : LightThemeCustom}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors[theme].background }}
      >
        {children}
        <Toasts
          overrideDarkMode={theme !== "dark"}
          defaultStyle={{
            indicator: { backgroundColor: colors[theme].primary },
          }}
        />
      </SafeAreaView>
      {exitConfirmationModalVisible && (
        <ExitConfirmationAlert
          onCancel={handleCancelExitConfirmation}
          onConfirm={handleConfirmExitConfirmation}
        />
      )}
    </ThemeProvider>
  );
}
