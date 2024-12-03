import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
  Dimensions,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "@/components/themed";
import {
  ChevronUp,
  Filter,
  LayoutGrid,
  Menu,
  Plus,
  Rows3,
  Spline,
  SquarePen,
} from "lucide-react-native";
import colors from "@/constants/colors";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getAllNotes } from "@/queries/notes";
import NoteCardGrid from "@/components/note_card_grid";
import Loader from "@/components/loading";
import { MotiView } from "moti";
import NoteCardList from "@/components/note_card_list";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");
  const listRef = useRef<RecyclerListView>(null);
  const { width } = Dimensions.get("window");

  // notes data
  const { data: notesData, isLoading: isLoadingNotesData } = useQuery({
    queryKey: ["notes"],
    queryFn: () => getAllNotes(),
  });

  const notes = notesData
    ? [...notesData, ...Array((3 - (notesData.length % 3)) % 3).fill({})]
    : [];

  // notes list
  const dataProvider = new DataProvider(
    (r1, r2) => r1.id !== r2.id
  ).cloneWithRows(displayMode === "grid" ? notes : notesData!);

  const layoutProvider = new LayoutProvider(
    () => "note",
    (type, dim) => {
      dim.width = width / (displayMode === "grid" ? 3 : 1);
      dim.height = displayMode === "grid" ? 216 : 140;
    }
  );

  const rowRenderer = (_type: any, data: Note, index: number) => {
    return displayMode === "grid" ? (
      <NoteCardGrid note={data} index={index} />
    ) : (
      <NoteCardList note={data} index={index} />
    );
  };

  // scroll management
  // const contentScrollY = useRef(0);
  // const scrollToTop = () => {
  //   listRef.current?.scrollToOffset(0, 0, true);
  // };

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
            <TouchableOpacity
              onPress={() => setDisplayMode("list")}
              disabled={notes?.length === 0}
            >
              <LayoutGrid
                size={24}
                color={
                  notes?.length > 0
                    ? colorScheme === "light"
                      ? colors.light.tint
                      : colors.dark.tint
                    : colorScheme === "light"
                    ? colors.light.text_muted2
                    : colors.dark.text_muted2
                }
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setDisplayMode("grid")}
              disabled={notes?.length === 0}
            >
              <Rows3
                size={24}
                color={
                  notes?.length > 0
                    ? colorScheme === "light"
                      ? colors.light.tint
                      : colors.dark.tint
                    : colorScheme === "light"
                    ? colors.light.text_muted2
                    : colors.dark.text_muted2
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
            All Notes ({notes.length})
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
              <SquarePen
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
                Edit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {isLoadingNotesData ? (
          <View style={styles.loadingContainer}>
            <Loader />
            <Text style={styles.loadingText}>Loading notes...</Text>
          </View>
        ) : (
          <RecyclerListView
            ref={listRef}
            dataProvider={dataProvider}
            layoutProvider={layoutProvider}
            rowRenderer={rowRenderer}
            renderAheadOffset={500}
            key={displayMode}
          />
        )}
      </View>

      {!isLoadingNotesData && (
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

          <MotiView
            from={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            transition={{
              type: "timing",
              duration: 200,
            }}
            style={styles.fabContainer}
          >
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
          </MotiView>
        </View>
      )}

      {/* {!isLoadingNotesData && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{
            opacity: 1,
          }}
          transition={{
            type: "timing",
            duration: 200,
          }}
          style={styles.scrollButtonContainer}
        >
          <TouchableOpacity
            style={[
              styles.scrollButtonIcon,
              colorScheme === "light"
                ? { backgroundColor: colors.light.primary }
                : { backgroundColor: colors.light.primary },
            ]}
          >
            <ChevronUp
              size={24}
              color={colors.dark.tint}
              strokeWidth={1.5}
              onPress={scrollToTop}
            />
          </TouchableOpacity>
        </MotiView>
      )} */}
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
    gap: 20,
    paddingBottom: 12,
    width: "100%",
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    alignSelf: "center",
    marginBottom: 56,
  },
  scrollButtonContainer: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
  },
  scrollButtonIcon: {
    padding: 4,
    borderRadius: 9999,
  },
});
