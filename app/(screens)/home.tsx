import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { Text, TextInput, View } from "@/components/themed";
import {
  Filter,
  LayoutGrid,
  ListFilter,
  Menu,
  Plus,
  Rows3,
  Spline,
} from "lucide-react-native";
import colors from "@/constants/colors";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getAllNotes } from "@/queries/notes";
import NoteCard from "@/components/note_card";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");
  const colorScheme = useColorScheme();

  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ["notes"],
    queryFn: () => getAllNotes(),
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor:
                colorScheme === "light"
                  ? colors.light.foggy2
                  : colors.dark.foggy2,
            },
          ]}
        >
          <TouchableOpacity>
            <Menu
              size={24}
              color={
                colorScheme === "light" ? colors.light.tint : colors.dark.tint
              }
              strokeWidth={1.8}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.searchInput}
            placeholder="Find your notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {displayMode === "grid" ? (
            <TouchableOpacity onPress={() => setDisplayMode("list")}>
              <LayoutGrid
                size={24}
                color={
                  colorScheme === "light" ? colors.light.tint : colors.dark.tint
                }
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setDisplayMode("grid")}>
              <Rows3
                size={24}
                color={
                  colorScheme === "light" ? colors.light.tint : colors.dark.tint
                }
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          )}

          {/* <TouchableOpacity
            style={[
              styles.settingsButton,
              colorScheme === "light"
                ? { backgroundColor: colors.light.primary }
                : { backgroundColor: colors.dark.primary },
            ]}
          >
            <Settings size={20} color={colors.dark.tint} strokeWidth={1.5} />
          </TouchableOpacity> */}
        </View>

        <View style={styles.subHeader}>
          <Text
            style={[
              styles.notesCount,
              {
                color:
                  colorScheme === "light"
                    ? colors.light.text_muted
                    : colors.dark.text_muted,
              },
            ]}
          >
            NOTES (0)
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Filter
                size={16}
                color={
                  colorScheme === "light"
                    ? colors.light.text_muted
                    : colors.dark.text_muted
                }
                strokeWidth={1.5}
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color:
                      colorScheme === "light"
                        ? colors.light.text_muted
                        : colors.dark.text_muted,
                  },
                ]}
              >
                Sort
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <ListFilter
                size={16}
                color={
                  colorScheme === "light"
                    ? colors.light.text_muted
                    : colors.dark.text_muted
                }
                strokeWidth={1.5}
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color:
                      colorScheme === "light"
                        ? colors.light.text_muted
                        : colors.dark.text_muted,
                  },
                ]}
              >
                Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          key={displayMode}
          data={notes}
          renderItem={({ item }) => <NoteCard note={item} />}
          numColumns={displayMode === "grid" ? 2 : 1}
          style={styles.noteListContainer}
          contentContainerStyle={styles.notesListWrapper}
          columnWrapperStyle={
            displayMode === "grid" ? styles.notesListWrapper : null
          }
        />
      </View>

      <View style={styles.addButtonContainer}>
        {notes?.length === 0 && (
          <Text style={styles.emptyText}>
            Let's start by creating your first{" "}
            <Text
              style={[
                styles.emptyText,
                colorScheme === "light"
                  ? { color: colors.light.primary }
                  : { color: colors.dark.primary },
              ]}
            >
              note
            </Text>
          </Text>
        )}

        <View style={styles.fabContainer}>
          {notes?.length === 0 && (
            <Spline
              size={36}
              color={
                colorScheme === "light"
                  ? colors.light.primary
                  : colors.dark.primary
              }
              strokeWidth={1.5}
              style={styles.spline}
            />
          )}
          <TouchableOpacity
            style={[
              styles.fab,
              colorScheme === "light"
                ? { backgroundColor: colors.light.primary }
                : { backgroundColor: colors.dark.primary },
            ]}
            onPress={() => router.push("./(notes)/new")}
          >
            <Plus size={28} color={colors.dark.text} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },

  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    lineHeight: 28,
  },

  settingsButton: {
    borderRadius: 20,
    padding: 8,
    marginLeft: 4,
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notesCount: {
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
  actionText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  noteListContainer: {
    paddingHorizontal: 16,
  },
  notesListWrapper: {
    gap: 12,
  },

  emptyText: {
    letterSpacing: 0.5,
    width: "auto",
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 32,
    right: 32,
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 20,
  },
  fabContainer: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "transparent",
    gap: 20,
  },
  spline: {
    transform: [{ rotate: "270deg" }],
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
