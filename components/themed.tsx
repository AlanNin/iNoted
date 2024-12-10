import {
  Text as DefaultText,
  View as DefaultView,
  TouchableOpacity as DefaultTouchableOpacity,
  TextInput as DefaultTextInput,
} from "react-native";
import { MarkdownTextInput as DefaultMarkdownTextInput } from "@expensify/react-native-live-markdown";
import { MotiView as DefaultMotiView } from "moti";
import useColorScheme from "@/hooks/useColorScheme";
import colors from "@/constants/colors";
import {
  MotiViewProps,
  TextInputProps,
  TextProps,
  TouchableOpacityProps,
  ViewProps,
  MarkdownTextInputProps,
} from "@/types/themed";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof colors.light & keyof typeof colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, customTextColor, ...otherProps } = props;
  const color = useThemeColor(
    { light: customTextColor, dark: customTextColor },
    "text"
  );

  return (
    <DefaultText
      style={[{ color, fontFamily: "Geist-Regular", fontSize: 16 }, style]}
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
    ...otherProps
  } = props;

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
        },
        style,
      ]}
      placeholderTextColor={placeholderTextColor}
      {...otherProps}
    />
  );
}

export function MarkdownTextInput(props: MarkdownTextInputProps) {
  const {
    style,
    customTextColor,
    customPlaceholderColor,
    ...otherProps
  } = props;

  const color = useThemeColor(
    { light: customTextColor, dark: customTextColor },
    "text"
  );

  const placeholderTextColor = useThemeColor(
    { light: customPlaceholderColor, dark: customPlaceholderColor },
    "text_muted"
  );

  return (
    <DefaultMarkdownTextInput
      style={[
        {
          color,
          fontFamily: "Geist-Regular",
          fontSize: 16,
        },
        style,
      ]}
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
