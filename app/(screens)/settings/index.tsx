import { StyleSheet } from "react-native";
import React from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "@/components/themed";
import Icon from "@/components/icon";
import { router } from "expo-router";

const settings = [
  {
    title: "Appearance",
    icon: "Palette",
    description:
      "Tweak the app's look and vibe, change themes, colors, and more!",
    route: "settings/appearance",
    isEnabled: true,
  },
  {
    title: "Data and Storage",
    icon: "Database",
    description: "Manage your data, create and restore backups.",
    route: "settings/storage",
    isEnabled: true,
  },

  {
    title: "About",
    icon: "Info",
    description:
      "Find out more about the app, its version, and the reason behind it.",
    route: "settings/about",
    isEnabled: true,
  },
  {
    title: "FAQ",
    icon: "CircleHelp",
    description:
      "Get answers to common questions and learn how to use the app effectively.",
    route: "settings/faq",
    isEnabled: true,
  },
];

const SettingsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <View style={styles.headerButton}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="ArrowLeft" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerText}>Settings</Text>
          </View>
        </View>
        <View style={styles.settingsContainer}>
          {settings.map((setting) => (
            <TouchableOpacity
              key={setting.title}
              style={styles.settingsButton}
              onPress={() => router.push(setting.route)}
              disabled={!setting.isEnabled}
            >
              <Icon
                name={setting.icon}
                size={24}
                strokeWidth={2}
                themed={setting.isEnabled}
                muted={!setting.isEnabled}
              />
              <View style={styles.settingsButtonDetails}>
                <Text disabled={!setting.isEnabled}>{setting.title}</Text>
                {setting.description && (
                  <Text
                    style={styles.settingsButtonDetailsDescription}
                    disabled
                  >
                    {setting.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100%",
  },
  wrapper: {
    flex: 1,
    paddingVertical: 16,
  },
  header: {
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  settingsContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 12,
  },
  settingsButton: {
    padding: 16,
    borderRadius: 8,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  settingsButtonDetails: {
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },
  settingsButtonDetailsDescription: {
    fontSize: 12,
  },
});
