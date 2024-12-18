import { icons } from "lucide-react-native";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import { IconColorTypeProps, IconProps } from "@/types/icon";
import { ViewStyle } from "react-native";

const getIconColorType = (
  themed: boolean,
  muted: boolean,
  grayscale: boolean
): IconColorTypeProps => {
  if (themed) return "themed";
  else if (muted) return "muted";
  else if (grayscale) return "grayscale";
  return "default";
};

const getColor = (theme: "light" | "dark", type: IconColorTypeProps) => {
  const colorConfig = {
    default: colors[theme].tint,
    muted: colors[theme].text_muted,
    grayscale: colors[theme].grayscale,
    themed: colors[theme].primary,
  };

  return colorConfig[type];
};

const Icon = ({
  name,
  size = 24,
  strokeWidth = 1.5,
  style,
  customColor,
  muted = false,
  grayscale = false,
  themed = false,
}: IconProps) => {
  const theme = useColorScheme();

  const LucideIcon = (icons as Record<
    string,
    React.ComponentType<{
      color: string;
      size: number;
      strokeWidth: number;
      style?: ViewStyle;
      backgroundColor?: string;
    }>
  >)[name];

  const iconColorType = getIconColorType(themed, muted, grayscale);

  const iconColor = customColor || getColor(theme, iconColorType);

  return LucideIcon ? (
    <LucideIcon
      color={iconColor}
      size={size}
      strokeWidth={strokeWidth}
      style={style}
    />
  ) : null;
};

export default Icon;
