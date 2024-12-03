import { ViewStyle } from "react-native";

export type IconProps = {
  name: string;
  size?: number;
  strokeWidth?: number;
  style?: ViewStyle;
  customColor?: string;
  muted?: boolean;
  grayscale?: boolean;
  themed?: boolean;
};

export type IconColorTypeProps = "default" | "themed" | "muted" | "grayscale";
