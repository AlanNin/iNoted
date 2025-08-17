import useColorScheme from "@/hooks/useColorScheme";
import { Drawer } from "expo-router/drawer";
import colors from "@/constants/colors";
import Icon from "@/components/icon";
import CustomDrawerContent from "@/components/drawers/custom_drawer_content";
import React from "react";
import {
  setStatusBarStyle,
  setStatusBarBackgroundColor,
} from "expo-status-bar";
import { AppState } from "react-native";
import { AppStateStatus } from "react-native";

export default function ScreensLayout() {
  const theme = useColorScheme();
  React.useEffect(() => {
    const changeStatusBarStyle = () => {
      setStatusBarStyle(theme === "light" ? "dark" : "light");
      setStatusBarBackgroundColor(colors[theme].background);
    };

    changeStatusBarStyle();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        changeStatusBarStyle();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [theme]);

  return (
    <Drawer
      backBehavior="history"
      drawerContent={CustomDrawerContent}
      screenOptions={{
        drawerActiveBackgroundColor: colors[theme].primary,
        drawerActiveTintColor: colors.dark.text,
        drawerInactiveTintColor: colors[theme].text_muted,
        drawerItemStyle: {
          borderRadius: 8,
        },
        drawerStyle: {
          backgroundColor: colors[theme].background,
        },
        swipeEnabled: false,
      }}
    >
      <Drawer.Screen
        name="notes"
        options={{
          headerShown: false,
          drawerLabel: "Notes",
          drawerIcon: ({ size, focused }) => (
            <Icon
              name="NotepadText"
              size={size}
              customColor={
                focused ? colors.dark.tint : colors[theme].text_muted
              }
            />
          ),
        }}
      />

      <Drawer.Screen
        name="notebooks"
        options={{
          headerShown: false,
          drawerLabel: "Notebooks",
          drawerIcon: ({ size, focused }) => (
            <Icon
              name="Notebook"
              size={size}
              customColor={
                focused ? colors.dark.tint : colors[theme].text_muted
              }
            />
          ),
        }}
      />

      <Drawer.Screen
        name="calendar"
        options={{
          headerShown: false,
          drawerLabel: "Calendar",
          drawerIcon: ({ size, focused }) => (
            <Icon
              name="Calendar"
              size={size}
              customColor={
                focused ? colors.dark.tint : colors[theme].text_muted
              }
            />
          ),
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          headerShown: false,
          drawerItemStyle: { display: "none" },
        }}
      />

      <Drawer.Screen
        name="[noteId]"
        options={{
          headerShown: false,
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer>
  );
}
