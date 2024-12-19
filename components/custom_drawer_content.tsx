import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Text, View } from "./themed";
import Icon from "./icon";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import { StyleSheet } from "react-native";
import { router } from "expo-router";
import { Route } from "@react-navigation/native";
import { Image } from "expo-image";

export default function CustomDrawerContent(props: any) {
  const theme = useColorScheme();
  const image = theme === "light" ? "app_long" : "dark_app_long";

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerHeader}>
          <Image
            source={image}
            style={styles.drawerHeaderImage}
            contentFit="contain"
          />
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={[styles.drawerSettingsContainer]}>
        <DrawerItem
          label="Settings"
          focused={
            props.state.index ===
            props.state.routes.findIndex(
              (route: Route<string>) => route.name === "(settings)"
            )
          }
          activeBackgroundColor={colors[theme].primary}
          activeTintColor={colors.dark.text}
          inactiveTintColor={colors[theme].text_muted}
          style={{ borderRadius: 8 }}
          icon={({ size, focused }) => (
            <Icon
              name="Settings"
              size={size}
              customColor={
                focused ? colors.dark.tint : colors[theme].text_muted
              }
            />
          )}
          onPress={() => router.push("./(settings)")}
        />
      </View>
      <View
        style={[
          styles.drawerFooter,
          { borderTopColor: colors[theme].foggiest },
        ]}
      >
        <Text style={styles.versionText} disabled>
          Version: 1.0.0 - © 2024 Alan Nin
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  drawerHeaderImage: {
    width: 180,
    height: 180,
  },
  drawerSettingsContainer: {
    marginTop: "auto",
    paddingVertical: 16,
    paddingHorizontal: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  drawerFooter: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  versionText: {
    fontSize: 10,
    paddingHorizontal: 16,
  },
});
