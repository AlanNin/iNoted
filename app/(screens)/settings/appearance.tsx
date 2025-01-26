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
import useAppConfig from "@/hooks/useAppConfig";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomDrawerTheme from "@/components/bottom_drawer_theme";
import { reloadAppAsync } from "expo";

const themeOptions = ["system", "light", "dark"] as const;

export type ThemeProps = typeof themeOptions[number];

const AppearanceScreen = () => {
  const [appTheme, saveAppTheme] = useAppConfig<ThemeProps>(
    "appTheme",
    "system"
  );
  const [selectedTheme, setSelectedTheme] = React.useState<ThemeProps>(
    appTheme
  );

  React.useEffect(() => {
    setSelectedTheme(appTheme);
  }, [appTheme]);

  const mutableThemeOptions: ThemeProps[] = [...themeOptions];

  const bottomThemeDrawerRef = React.useRef<BottomSheetModal>(null);

  const handleToggleBottomThemeDrawer = () => {
    bottomThemeDrawerRef.current?.present();
  };

  const handleApplyTheme = (theme: ThemeProps) => {
    saveAppTheme(theme);
    reloadAppAsync();
  };

  const handleCancelApplyTheme = () => {
    setSelectedTheme(appTheme);
  };

  const isApplyDisabled = selectedTheme === appTheme;

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <View style={styles.headerButton}>
              <TouchableOpacity onPress={() => router.back()}>
                <Icon name="ArrowLeft" size={24} />
              </TouchableOpacity>
              <Text style={styles.headerText}>Appearance</Text>
            </View>
          </View>
          <View style={styles.contentContainer}>
            <TouchableOpacity
              style={styles.itemsButton}
              onPress={handleToggleBottomThemeDrawer}
            >
              <View style={styles.itemButtonDetails}>
                <Text>App Theme</Text>
                <Text style={styles.itemButtonDetailsDescription} disabled>
                  Use System theme
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      <BottomDrawerTheme
        ref={bottomThemeDrawerRef}
        title="Select theme"
        description="Choose a theme for your app."
        themes={mutableThemeOptions}
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
        onApply={handleApplyTheme}
        onCancel={handleCancelApplyTheme}
        isApplyDisabled={isApplyDisabled}
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
    gap: 12,
    paddingHorizontal: 8,
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
