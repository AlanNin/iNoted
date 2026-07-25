import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../themed";
import Icon from "../icon";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import { router } from "expo-router";
import { Image } from "expo-image";
import * as Application from "expo-application";
import { DrawerContentComponentProps } from "expo-router/drawer";

export default function CustomDrawerContent(
  props: DrawerContentComponentProps
) {
  const theme = useColorScheme();
  const image = theme === "light" ? "app_long" : "dark_app_long";
  const { state, descriptors, navigation } = props;

  return (
    <View
      style={{
        flex: 1,
        overflow: "hidden",
      }}
    >
      <ScrollView contentContainerStyle={{ paddingTop: 12 }}>
        <View style={styles.drawerHeader}>
          <Image
            source={image}
            style={styles.drawerHeaderImage}
            contentFit="contain"
          />
        </View>

        {state.routes
          .filter((route) => {
            const options = descriptors[route.key]?.options;
            const style = StyleSheet.flatten(options?.drawerItemStyle);

            return style?.display !== "none";
          })
          .map((route, index) => {
            const { options } = descriptors[route.key] ?? { options: {} };
            const focused = state.index === index;
            const label =
              typeof options.drawerLabel === "string"
                ? options.drawerLabel
                : options.title ?? route.name;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                style={[
                  styles.drawerItem,
                  focused && { backgroundColor: colors[theme].primary },
                ]}
              >
                {options.drawerIcon?.({
                  focused,
                  size: 20,
                  color: focused ? colors.dark.text : colors[theme].text_muted,
                })}
                <Text
                  style={{
                    color: focused
                      ? colors.dark.text
                      : colors[theme].text_muted,
                    marginLeft: 12,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
      </ScrollView>

      <View style={[styles.drawerSettingsContainer]}>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={[
            styles.drawerItem,
            state.routes[state.index]?.name === "settings" && {
              backgroundColor: colors[theme].primary,
            },
          ]}
        >
          <Icon
            name="Settings"
            size={20}
            customColor={
              state.routes[state.index]?.name === "settings"
                ? colors.dark.tint
                : colors[theme].text_muted
            }
          />
          <Text
            style={{
              color:
                state.routes[state.index]?.name === "settings"
                  ? colors.dark.text
                  : colors[theme].text_muted,
              marginLeft: 12,
            }}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.drawerFooter,
          { borderTopColor: colors[theme].foggiest },
        ]}
      >
        <Text style={styles.versionText} disabled>
          Version: {Application.nativeApplicationVersion} - ©{" "}
          {new Date().getFullYear()} NinCloud
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
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginVertical: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
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
