import { useColorScheme as useNativeColorScheme } from "react-native";
import { ThemeProps } from "@/app/(screens)/settings/appearance";
import { useConfig } from "@/providers/config";

const useColorScheme = (): "light" | "dark" => {
  const [appTheme] = useConfig<ThemeProps>("appTheme", "system");
  const systemColorScheme = useNativeColorScheme();

  const theme = appTheme === "system" ? systemColorScheme ?? "dark" : appTheme;

  return theme;
};

export default useColorScheme;
