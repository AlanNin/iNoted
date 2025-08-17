import { StyleSheet } from "react-native";
import React from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "@/components/themed";
import { router } from "expo-router";
import Icon from "@/components/icon";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useConfig } from "@/providers/config";
import BottomDrawerOptions from "@/components/drawers/bottom_drawer_options";
import BooleanSwitch from "@/components/boolean_switch";
import useColorScheme from "@/hooks/useColorScheme";
import colors from "@/constants/colors";

const themeOptions = ["system", "light", "dark"] as const;

export type ThemeProps = typeof themeOptions[number];

const AppearanceScreen = () => {
  const theme = useColorScheme();

  // Start Screen
  const [appStartScreen, saveAppStartScreen] = useConfig<"notes" | "notebooks">(
    "appStartScreen",
    "notes"
  );

  const startScreenBottomDrawerRef = React.useRef<BottomSheetModal>(null);

  const handleToggleBottomStartScreenDrawer = () => {
    startScreenBottomDrawerRef.current?.present();
  };

  const handleSelectStartScreen = (screen: string) => {
    saveAppStartScreen(screen as "notes" | "notebooks");
  };

  // Exit Confirmation
  const [isExitConfirmationEnabled, saveIsExitConfirmationEnabled] = useConfig<
    boolean
  >("isExitConfirmationEnabled", false);

  const handleExitConfirmationEnabled = (enabled: boolean) => {
    saveIsExitConfirmationEnabled(enabled);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <View style={styles.headerButton}>
              <TouchableOpacity onPress={() => router.back()}>
                <Icon name="ArrowLeft" size={24} />
              </TouchableOpacity>
              <Text style={styles.headerText}>General</Text>
            </View>
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.section}>
              <Text
                style={styles.label}
                customBackgroundColor={colors[theme].foggier}
              >
                Startup
              </Text>
              <TouchableOpacity
                style={styles.itemsButton}
                onPress={handleToggleBottomStartScreenDrawer}
              >
                <View style={styles.itemButtonDetails}>
                  <Text>Default Start Screen</Text>
                  <Text style={styles.itemButtonDetailsDescription} disabled>
                    {appStartScreen.charAt(0).toUpperCase() +
                      appStartScreen.slice(1)}{" "}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              <Text
                style={styles.label}
                customBackgroundColor={colors[theme].foggier}
              >
                Exit Behavior
              </Text>
              <BooleanSwitch
                label="Ask For Exit Confirmation"
                selectedValue={isExitConfirmationEnabled}
                handleSelectValue={handleExitConfirmationEnabled}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
      <BottomDrawerOptions
        ref={startScreenBottomDrawerRef}
        title="Choose Your Start Screen"
        options={[
          {
            key: "notes",
            label: "Notes",
            icon: "NotepadText",
          },
          {
            key: "notebooks",
            label: "Notebooks",
            icon: "Notebook",
          },
        ]}
        selectedOption={appStartScreen}
        handleSelectOption={handleSelectStartScreen}
      />
    </>
  );
};

export default AppearanceScreen;

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
  contentContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  section: {
    flexDirection: "column",
    gap: 2,
  },
  label: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 16,
    marginBottom: 8,
  },
  itemsButton: {
    padding: 16,
    borderRadius: 8,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  itemButtonDetails: {
    flexDirection: "column",
    gap: 4,
  },
  itemButtonDetailsDescription: {
    fontSize: 12,
  },
});
