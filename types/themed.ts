import {
  Text as DefaultText,
  View as DefaultView,
  TouchableOpacity as DefaultTouchableOpacity,
  TextInput as DefaultTextInput,
} from "react-native";
import { MotiView as DefaultMotiView } from "moti";

type ThemedProps = {
  customBackgroundColor?: string;
};

type ThemedTextProps = ThemedProps & {
  customTextColor?: string;
  disabled?: boolean;
};

type ThemedInputProps = ThemedTextProps & {
  customPlaceholderColor?: string;
};

export type ViewProps = ThemedProps & DefaultView["props"];
export type TextProps = ThemedTextProps & DefaultText["props"];
export type TouchableOpacityProps = ThemedProps &
  React.ComponentProps<typeof DefaultTouchableOpacity>;
export type TextInputProps = ThemedInputProps & DefaultTextInput["props"];
export type MotiViewProps = ThemedProps &
  React.ComponentProps<typeof DefaultMotiView>;
