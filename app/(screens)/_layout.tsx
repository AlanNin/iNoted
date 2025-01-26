import useColorScheme from "@/hooks/useColorScheme";
import { Drawer } from "expo-router/drawer";
import colors from "@/constants/colors";
import Icon from "@/components/icon";
import CustomDrawerContent from "@/components/custom_drawer_content";

export default function ScreensLayout() {
  const theme = useColorScheme();

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
    </Drawer>
  );
}
