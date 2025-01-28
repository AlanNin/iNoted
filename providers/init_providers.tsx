import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import { Toasts } from "@backpackapp-io/react-native-toast";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InitProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useColorScheme();
  const LightThemeCustom = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.light.background,
      primary: colors.light.primary,
    },
  };
  const DarkThemeCustom = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.dark.background,
      primary: colors.dark.primary,
    },
  };

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
    </ThemeProvider>
  );
}
