import { useColorScheme as useNativeColorScheme } from "react-native";

const useColorScheme = (): "light" | "dark" => {
  const systemColorScheme = useNativeColorScheme();
  return systemColorScheme || "dark";
};

export default useColorScheme;
