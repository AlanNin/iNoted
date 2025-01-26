import { ThemeProps } from "@/app/(screens)/settings/appearance";

export type BottomDrawerThemeProps = {
  title: string;
  description: string;
  themes: ThemeProps[];
  selectedTheme: ThemeProps;
  setSelectedTheme: (theme: ThemeProps) => void;
  onApply: (theme: ThemeProps) => void;
  onCancel: () => void;
  isApplyDisabled: boolean;
};
