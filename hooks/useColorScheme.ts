import { useColorScheme as useNativeColorScheme } from "react-native";
import useAppConfig from "./useAppConfig";
import { ThemeProps } from "@/app/(screens)/settings/appearance";

const useColorScheme = (): "light" | "dark" => {
  const [appTheme] = useAppConfig<ThemeProps>("appTheme", "system");
  const systemColorScheme = useNativeColorScheme();

  const theme = appTheme === "system" ? systemColorScheme ?? "dark" : appTheme;

  return theme;
};

export default useColorScheme;
