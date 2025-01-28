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
import BottomDrawerTheme from "@/components/bottom_drawer_theme";
import { useConfig } from "@/providers/config";
import useColorScheme from "@/hooks/useColorScheme";
import colors from "@/constants/colors";
import BottomDrawerSort from "@/components/bottom_drawer_sort";

const themeOptions = ["system", "light", "dark"] as const;
const sortTypes = ["Recently added", "A-Z"] as const;

export type ThemeProps = typeof themeOptions[number];

const AppearanceScreen = () => {
  const theme = useColorScheme();

  // Theme
  const [appTheme, saveAppTheme] = useConfig<ThemeProps>("appTheme", "system");
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
  };

  const handleCancelApplyTheme = () => {
    setSelectedTheme(appTheme);
  };

  const isApplyDisabled = selectedTheme === appTheme;

  // Sort Notes
  const notesSortBottomDrawerRef = React.useRef<BottomSheetModal>(null);

  const handleToggleBottomNotesSortDrawer = () => {
    notesSortBottomDrawerRef.current?.present();
  };

  const [notesSortBy, saveNotesSortBy] = useConfig<{
    key: typeof sortTypes[number];
    order: "asc" | "desc";
  }>("notesSortBy", { key: sortTypes[0], order: "desc" });

  const toggleNotesSortOrder = (actionTitle: typeof sortTypes[number]) => {
    saveNotesSortBy((prevState) => {
      return {
        key: actionTitle,
        order:
          prevState?.key === actionTitle && prevState?.order === "desc"
            ? "asc"
            : "desc",
      };
    });
  };

  // Sort Notebooks
  const notebooksSortBottomDrawerRef = React.useRef<BottomSheetModal>(null);

  const handleToggleBottomNotebooksSortDrawer = () => {
    notebooksSortBottomDrawerRef.current?.present();
  };

  const [notebooksSortBy, saveNotebooksSortBy] = useConfig<{
    key: typeof sortTypes[number];
    order: "asc" | "desc";
  }>("notebooksSortBy", { key: sortTypes[0], order: "desc" });

  const toggleNotebooksSortOrder = (actionTitle: typeof sortTypes[number]) => {
    saveNotebooksSortBy((prevState) => {
      return {
        key: actionTitle,
        order:
          prevState?.key === actionTitle && prevState?.order === "desc"
            ? "asc"
            : "desc",
      };
    });
  };

  // Layout Notes
  const [notesViewMode, saveNotesViewMode] = useConfig<"grid" | "list">(
    "notesViewMode",
    "grid"
  );

  const handleToggleNotesViewMode = () => {
    saveNotesViewMode((prevState) => {
      return prevState === "grid" ? "list" : "grid";
    });
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
              <Text style={styles.headerText}>Appearance</Text>
            </View>
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.section}>
              <Text
                style={styles.label}
                customTextColor={colors[theme].primary}
              >
                Theme
              </Text>
              <TouchableOpacity
                style={styles.itemsButton}
                onPress={handleToggleBottomThemeDrawer}
              >
                <View style={styles.itemButtonDetails}>
                  <Text>App Theme</Text>
                  <Text style={styles.itemButtonDetailsDescription} disabled>
                    {appTheme === "system"
                      ? "Use System Theme"
                      : appTheme === "light"
                      ? "Use Light Theme"
                      : "Use Dark Theme"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              <Text
                style={styles.label}
                customTextColor={colors[theme].primary}
              >
                Sorting
              </Text>
              <TouchableOpacity
                style={styles.itemsButton}
                onPress={handleToggleBottomNotesSortDrawer}
              >
                <View style={styles.itemButtonDetails}>
                  <Text>Sort Notes</Text>
                  <Text style={styles.itemButtonDetailsDescription} disabled>
                    {notesSortBy.key} -{" "}
                    {notesSortBy.order.charAt(0).toUpperCase() +
                      notesSortBy.order.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.itemsButton}
                onPress={handleToggleBottomNotebooksSortDrawer}
              >
                <View style={styles.itemButtonDetails}>
                  <Text>Sort Notebooks</Text>
                  <Text style={styles.itemButtonDetailsDescription} disabled>
                    {notebooksSortBy.key} -{" "}
                    {notebooksSortBy.order.charAt(0).toUpperCase() +
                      notebooksSortBy.order.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              <Text
                style={styles.label}
                customTextColor={colors[theme].primary}
              >
                Layout
              </Text>
              <TouchableOpacity
                style={styles.itemsButton}
                onPress={handleToggleNotesViewMode}
              >
                <View style={styles.itemButtonDetails}>
                  <Text>Notes Layout</Text>
                  <Text style={styles.itemButtonDetailsDescription} disabled>
                    {notesViewMode.charAt(0).toUpperCase() +
                      notesViewMode.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
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
      <BottomDrawerSort
        ref={notesSortBottomDrawerRef}
        title="Sort your notes"
        actions={sortTypes.map((type) => ({
          title: type,
          action: () => toggleNotesSortOrder(type),
          isSelected: notesSortBy.key === type,
          order: notesSortBy.order,
        }))}
      />
      <BottomDrawerSort
        ref={notebooksSortBottomDrawerRef}
        title="Sort your notebooks"
        actions={sortTypes.map((type) => ({
          title: type,
          action: () => toggleNotebooksSortOrder(type),
          isSelected: notebooksSortBy.key === type,
          order: notebooksSortBy.order,
        }))}
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
    gap: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  section: {
    flexDirection: "column",
    gap: 2,
  },
  label: {
    paddingHorizontal: 16,
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
