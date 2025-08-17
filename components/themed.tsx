import {
  Text as DefaultText,
  View as DefaultView,
  TouchableOpacity as DefaultTouchableOpacity,
  TextInput as DefaultTextInput,
  SafeAreaView as DefaultSafeAreaView,
} from "react-native";
import { MotiView as DefaultMotiView } from "moti";
import useColorScheme from "@/hooks/useColorScheme";
import colors from "@/constants/colors";
import {
  MotiViewProps,
  TextInputProps,
  TextProps,
  TouchableOpacityProps,
  ViewProps,
  SafeAreaViewProps,
} from "@/types/themed";

type Theme = keyof typeof colors;

function hasTextProp(x: unknown): x is { text: string } {
  return (
    !!x &&
    typeof x === "object" &&
    "text" in x &&
    typeof (x as any).text === "string"
  );
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof colors["light"] & keyof typeof colors["dark"]
) {
  const theme = useColorScheme() as Theme;
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  const raw = (colors as any)[theme][colorName] as unknown;

  if (typeof raw === "string") {
    return raw;
  }
  if (hasTextProp(raw)) {
    return raw.text;
  }

  return "black";
}

export function Text(props: TextProps) {
  const {
    style,
    customTextColor,
    customBackgroundColor,
    disabled,
    ...otherProps
  } = props;
  const color = disabled
    ? useThemeColor({}, "text_muted")
    : useThemeColor({ light: customTextColor, dark: customTextColor }, "text");

  return (
    <DefaultText
      style={[
        {
          color,
          fontFamily: "Geist-Regular",
          backgroundColor: customBackgroundColor,
          fontSize: 16,
        },
        style,
      ]}
      {...otherProps}
    />
  );
}

export function View(props: ViewProps) {
  const { style, customBackgroundColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: customBackgroundColor, dark: customBackgroundColor },
    "background"
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function SafeAreaView(props: SafeAreaViewProps) {
  const { style, customBackgroundColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: customBackgroundColor, dark: customBackgroundColor },
    "background"
  );

  return (
    <DefaultSafeAreaView style={[{ backgroundColor }, style]} {...otherProps} />
  );
}

export function TouchableOpacity(props: TouchableOpacityProps) {
  const { style, customBackgroundColor = "transparent", ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: customBackgroundColor, dark: customBackgroundColor },
    "background"
  );

  return (
    <DefaultTouchableOpacity
      style={[{ backgroundColor }, style]}
      {...otherProps}
    />
  );
}

export function TextInput(props: TextInputProps) {
  const {
    style,
    customTextColor,
    customPlaceholderColor,
    customBackgroundColor,
    ...otherProps
  } = props;

  const theme = useColorScheme();

  const color = useThemeColor(
    { light: customTextColor, dark: customTextColor },
    "text"
  );

  const placeholderTextColor = useThemeColor(
    { light: customPlaceholderColor, dark: customPlaceholderColor },
    "text_muted"
  );

  return (
    <DefaultTextInput
      style={[
        {
          color,
          fontFamily: "Geist-Regular",
          fontSize: 16,
          backgroundColor: customBackgroundColor,
        },
        style,
      ]}
      selectionColor={colors[theme].primary}
      placeholderTextColor={placeholderTextColor}
      {...otherProps}
    />
  );
}

export function MotiView(props: MotiViewProps) {
  const { style, customBackgroundColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: customBackgroundColor, dark: customBackgroundColor },
    "background"
  );

  return (
    <DefaultMotiView style={[{ backgroundColor }, style]} {...otherProps} />
  );
}
