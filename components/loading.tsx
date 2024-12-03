import { Loader2 } from "lucide-react-native";
import React from "react";
import { useColorScheme } from "react-native";
import { MotiView } from "moti";
import colors from "@/constants/colors";
import { Easing } from "react-native-reanimated";

export default function Loader({
  size = 32,
  color,
  strokeWidth = 1.5,
}: Loader) {
  const colorScheme = useColorScheme();

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
            : colorScheme === "light"
            ? colors.light.tint
            : colors.dark.tint
        }
        strokeWidth={strokeWidth}
      />
    </MotiView>
  );
}
