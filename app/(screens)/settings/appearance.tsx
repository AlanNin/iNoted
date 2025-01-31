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
import BottomDrawerOptions from "@/components/bottom_drawer_options";
import { sortTypes } from "@/types/bottom_drawer_sort";

const themeOptions = ["system", "light", "dark"] as const;

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

  const handleSaveNotesSortOrder = (sort: any) => {
    saveNotesSortBy(sort);
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

  const handleSaveNotebooksSortOrder = (sort: any) => {
    saveNotebooksSortBy(sort);
  };

  // Layout Notes
  const layoutOptionsBottomDrawerRef = React.useRef<BottomSheetModal>(null);

  const handleToggleBottomLayoutOptionsDrawer = () => {
    layoutOptionsBottomDrawerRef.current?.present();
  };

  const [notesViewMode, saveNotesViewMode] = useConfig<"grid" | "list">(
    "notesViewMode",
    "grid"
  );

  const handleSelectOption = (option: string) => {
    saveNotesViewMode(option as "grid" | "list");
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
                customBackgroundColor={colors[theme].foggier}
              >
                Theme
              </Text>
              <TouchableOpacity
                style={styles.itemsButton}
                onPress={handleToggleBottomThemeDrawer}
              >
                <View style={styles.itemButtonDetails}>
                  <Text>Select Your Theme</Text>
                  <Text style={styles.itemButtonDetailsDescription} disabled>
                    {appTheme === "system"
                      ? "Currently using System Mode. Follows your device’s theme for a smooth look"
                      : appTheme === "light"
                      ? "Currently using Light Mode. Fresh and bright, keeps everything clear"
                      : "Currently using Dark Mode. Cool and cozy, perfect for a comfortable vibe"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              <Text
                style={styles.label}
                customBackgroundColor={colors[theme].foggier}
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
                customBackgroundColor={colors[theme].foggier}
              >
                Layout
              </Text>
              <TouchableOpacity
                style={styles.itemsButton}
                onPress={handleToggleBottomLayoutOptionsDrawer}
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
        title="Select Theme"
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
        title="Sort Your Notes"
        options={[sortTypes[0], sortTypes[1]]}
        selectedSort={notesSortBy}
        handleSortOrder={handleSaveNotesSortOrder}
      />
      <BottomDrawerSort
        ref={notebooksSortBottomDrawerRef}
        title="Sort Your Notebooks"
        options={[sortTypes[0], sortTypes[1]]}
        selectedSort={notebooksSortBy}
        handleSortOrder={handleSaveNotebooksSortOrder}
      />
      <BottomDrawerOptions
        ref={layoutOptionsBottomDrawerRef}
        title="Choose Your Notes Layout"
        options={[
          {
            key: "grid",
            label: "Grid",
            icon: "LayoutGrid",
          },
          {
            key: "list",
            label: "List",
            icon: "Rows2",
          },
        ]}
        selectedOption={notesViewMode}
        handleSelectOption={handleSelectOption}
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
