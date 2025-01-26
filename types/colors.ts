type ColorScheme = {
  text: string;
  text_muted: string;
  background: string;
  tint: string;
  grayscale: string;
  grayscale_light: string;
  primary: string;
  primary_dark: string;
  primary_light: string;
  primary_foggy: string;
  foggy: string;
  foggier: string;
  foggiest: string;
  danger: string;
  calendar_background: string;
  editor: {
    background: string;
    text: string;
    text_highlight: string;
    placeholder: string;
    toolbar_background: string;
    toolbar_icon: string;
    toolbar_icon_active: string;
    toolbar_active: string;
    toolbar_divider: string;
    checklist: string;
  };
};

type Colors = {
  light: ColorScheme;
  dark: ColorScheme;
};
