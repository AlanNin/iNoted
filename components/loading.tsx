import { Loader2 } from "lucide-react-native";
import React from "react";
import useColorScheme from "@/hooks/useColorScheme";
import { MotiView } from "moti";
import colors from "@/constants/colors";
import { Easing } from "react-native-reanimated";
import { LoaderProps } from "@/types/loader";

export default function Loader({
  size = 32,
  color,
  strokeWidth = 1.5,
}: LoaderProps) {
  const theme = useColorScheme();

  return (
    <MotiView
      animate={{ transform: [{ rotate: "360deg" }] }}
      from={{ transform: [{ rotate: "0deg" }] }}
      transition={{
        type: "timing",
        repeatReverse: false,
        loop: true,
        duration: 1000,
        easing: Easing.linear,
      }}
    >
      <Loader2
        size={size}
        color={
          color
            ? color
            : theme === "light"
            ? colors.light.tint
            : colors.dark.tint
        }
        strokeWidth={strokeWidth}
      />
    </MotiView>
  );
}
