import { StyleSheet, SafeAreaView, FlatList } from "react-native";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "@/components/themed";
import colors from "@/constants/colors";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getAllNotes } from "@/queries/notes";
import NoteCard from "@/components/note_card";
import Loader from "@/components/loading";
import { MotiView } from "moti";
import Icon from "@/components/icon";
import useColorScheme from "@/hooks/useColorScheme";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomDrawerSort from "@/components/bottom_drawer_sort";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const theme = useColorScheme();
  const sortBottomDrawerRef = React.useRef<BottomSheetModal>(null);
  const listRef = React.useRef<FlatList<NoteProps> | null>(null);
  const sortTypes = ["Recently added", "A-Z"] as const;
  const [sortBy, setSortBy] = React.useState<{
    key: string;
    order: "asc" | "desc";
  }>({ key: sortTypes[0], order: "desc" });

  // notes data
  const { data: notesData, isLoading: isLoadingNotesData } = useQuery({
    queryKey: ["notes"],
    queryFn: () => getAllNotes(),
  });

  const sortedNotes = React.useMemo(() => {
    if (!notesData) return [];

    const sorted = [...notesData];

    sorted.sort((a, b) => {
      let compareResult = 0;

      switch (sortBy.key) {
        case sortTypes[0]:
          compareResult =
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case sortTypes[1]:
          compareResult = a.title.localeCompare(b.title);
          break;
        default:
          compareResult = 0;
      }

      return sortBy.order === "asc" ? compareResult : -compareResult;
    });

    return sorted;
  }, [notesData, sortBy]);

  const notes = sortedNotes
    ? [...sortedNotes, ...Array((3 - (sortedNotes.length % 3)) % 3).fill({})]
    : [];

  const handlePresentModalPress = React.useCallback(() => {
    sortBottomDrawerRef.current?.present();
  }, []);

  const toggleSortOrder = (actionTitle: typeof sortTypes[number]) => {
    setSortBy((prevState) => ({
      key: actionTitle,
      order:
        prevState.key === actionTitle && prevState.order === "desc"
          ? "asc"
          : "desc",
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View
          style={styles.searchContainer}
          customBackgroundColor={colors[theme].foggier}
        >
          <TouchableOpacity>
            <Icon name="Menu" strokeWidth={1.8} />
          </TouchableOpacity>

          <TextInput
            style={styles.searchInput}
            placeholder="Find your notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {viewMode === "grid" ? (
            <TouchableOpacity
              onPress={() => setViewMode("list")}
              disabled={notesData?.length === 0}
            >
              <Icon name="LayoutGrid" muted={notesData?.length === 0} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setViewMode("grid")}
              disabled={notesData?.length === 0}
            >
              <Icon name="Rows3" muted={notesData?.length === 0} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.subHeader}>
          <Text
            style={styles.notesCount}
            customTextColor={colors[theme].grayscale}
          >
            All Notes ({isLoadingNotesData ? "..." : notesData?.length})
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePresentModalPress}
              disabled={notesData?.length === 0}
            >
              <Icon
                name="ArrowDownUp"
                size={16}
                grayscale
                muted={notesData?.length === 0}
              />
              <Text
                style={styles.actionText}
                customTextColor={colors[theme].grayscale}
                disabled={notesData?.length === 0}
              >
                Sort
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              disabled={notesData?.length === 0}
            >
              <Icon
                name="SquarePen"
                size={16}
                grayscale
                muted={notesData?.length === 0}
              />
              <Text
                style={styles.actionText}
                customTextColor={colors[theme].grayscale}
                disabled={notesData?.length === 0}
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
          <FlatList
            ref={listRef}
            key={viewMode}
            keyExtractor={(item, index) => item.id || `placeholder-${index}`}
            data={viewMode === "grid" ? notes : notesData}
            renderItem={({ item, index }) => (
              <NoteCard note={item} index={index} viewMode={viewMode} />
            )}
            numColumns={viewMode === "grid" ? 3 : 1}
            style={styles.noteListContainer}
            contentContainerStyle={styles.notesListWrapper}
            columnWrapperStyle={
              viewMode === "grid" ? styles.notesListWrapper : null
            }
            removeClippedSubviews={true}
          />
        )}
      </View>

      {!isLoadingNotesData && (
        <View style={styles.addButtonContainer}>
          {notesData?.length === 0 && (
            <Text style={styles.emptyText}>
              Let's start by creating your first{" "}
              <Text
                style={[styles.emptyText, { color: colors[theme].primary }]}
              >
                note
              </Text>
            </Text>
          )}

          <MotiView
            from={{ opacity: 0 }}
            animate={{
              // opacity: isFabVisible ? 1 : 0,
              opacity: 1,
            }}
            transition={{
              type: "timing",
              duration: 200,
            }}
            style={styles.fabContainer}
          >
            {notesData?.length === 0 && (
              <Icon name="Spline" themed size={36} style={styles.spline} />
            )}
            <TouchableOpacity
              style={styles.fab}
              customBackgroundColor={colors[theme].primary}
              onPress={() => router.push("./(notes)/new")}
            >
              <Icon name="Plus" size={28} customColor={colors.dark.tint} />
            </TouchableOpacity>
          </MotiView>
        </View>
      )}
      <BottomDrawerSort
        ref={sortBottomDrawerRef}
        title="Sort your notes"
        actions={sortTypes.map((type) => ({
          title: type,
          action: () => toggleSortOrder(type),
          isSelected: sortBy.key === type,
          order: sortBy.order,
        }))}
      />
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
