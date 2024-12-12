import { StyleSheet, SafeAreaView, FlatList, BackHandler } from "react-native";
import React from "react";
import {
  MotiView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "@/components/themed";
import colors from "@/constants/colors";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { deleteNotes, getAllNotes } from "@/queries/notes";
import NoteCard from "@/components/note_card";
import Loader from "@/components/loading";
import Icon from "@/components/icon";
import useColorScheme from "@/hooks/useColorScheme";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomDrawerSort from "@/components/bottom_drawer_sort";
import BottomDrawerConfirm from "@/components/bottom_drawer_confirm";
import { toast } from "@backpackapp-io/react-native-toast";
import { FlashList } from "@shopify/flash-list";
import { useEditMode } from "@/hooks/useEditMode";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const theme = useColorScheme();
  const sortBottomDrawerRef = React.useRef<BottomSheetModal>(null);
  const sortTypes = ["Recently added", "A-Z"] as const;
  const [sortBy, setSortBy] = React.useState<{
    key: string;
    order: "asc" | "desc";
  }>({ key: sortTypes[0], order: "desc" });
  const { isEditMode, toggleEditMode, selectedNotes } = useEditMode();
  const bottomDeleteMultipleDrawerRef = React.useRef<BottomSheetModal>(null);

  const {
    data: notesData,
    isLoading: isLoadingNotesData,
    refetch: refetchNotes,
  } = useQuery({
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

  const filteredNotes = React.useMemo(() => {
    return sortedNotes.filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedNotes, searchQuery]);

  const structuredNotes = React.useMemo(() => {
    return viewMode === "grid"
      ? [
          ...filteredNotes,
          ...Array((3 - (filteredNotes.length % 3)) % 3).fill({}),
        ]
      : filteredNotes;
  }, [viewMode, filteredNotes]);

  const handleToggleBottomSortDrawer = () => {
    sortBottomDrawerRef.current?.present();
  };

  const toggleSortOrder = (actionTitle: typeof sortTypes[number]) => {
    setSortBy((prevState) => ({
      key: actionTitle,
      order:
        prevState.key === actionTitle && prevState.order === "desc"
          ? "asc"
          : "desc",
    }));
  };

  React.useEffect(() => {
    const backAction = () => {
      if (isEditMode) {
        toggleEditMode();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isEditMode]);

  const handleToggleBottomDeleteMultipleDrawer = () => {
    bottomDeleteMultipleDrawerRef.current?.present();
  };

  const handleDeleteMultipleNotes = React.useCallback(async () => {
    try {
      await deleteNotes(selectedNotes);
      await refetchNotes();
      toast.success("Notes deleted successfully!");
      toggleEditMode();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }, [selectedNotes, toggleEditMode]);

  const renderItem = ({ item }: { item: NoteProps; index: number }) => (
    <NoteCard
      key={`${item.id}-${item.title}-${item.content}`}
      note={item}
      viewMode={viewMode}
    />
  );

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
              onPress={handleToggleBottomSortDrawer}
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
              onPress={toggleEditMode}
            >
              <Icon
                name={isEditMode ? "PenOff" : "SquarePen"}
                size={16}
                grayscale
                muted={notesData?.length === 0}
              />
              <Text
                style={styles.actionText}
                customTextColor={colors[theme].grayscale}
                disabled={notesData?.length === 0}
              >
                {isEditMode ? "Cancel Edit" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[styles.content, { paddingBottom: isEditMode ? 68 : 0 }]}>
        {isLoadingNotesData ? (
          <View style={styles.loadingContainer}>
            <Loader />
            <Text style={styles.loadingText}>Loading notes...</Text>
          </View>
        ) : (
          <FlashList
            key={viewMode}
            keyExtractor={(item, index) =>
              item.id ? item.id?.toString() : `placeholder-${index}`
            }
            data={structuredNotes}
            renderItem={renderItem}
            numColumns={viewMode === "grid" ? 3 : 1}
            removeClippedSubviews={true}
            estimatedItemSize={viewMode === "grid" ? 216 : 140}
          />
        )}
      </View>

      {!isLoadingNotesData && !isEditMode && (
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

      {isEditMode && (
        <MotiView
          style={[
            styles.editMenuContainer,
            { borderTopColor: colors[theme].foggier },
          ]}
          customBackgroundColor={colors[theme].background}
          from={{ opacity: 0, translateY: 10 }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: "timing",
            duration: 250,
          }}
        >
          <TouchableOpacity
            style={styles.editMenuButton}
            onPress={handleToggleBottomDeleteMultipleDrawer}
            disabled={selectedNotes.length === 0}
          >
            <Icon
              name="Eraser"
              size={24}
              strokeWidth={1}
              muted={selectedNotes.length === 0}
            />
            <Text
              style={styles.editMenuButtonText}
              customTextColor={colors[theme].text}
              disabled={selectedNotes.length === 0}
            >
              Delete
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editMenuButton}
            onPress={() => {}}
            disabled={selectedNotes.length === 0}
          >
            <Icon
              name="NotebookPen"
              size={24}
              strokeWidth={1}
              muted={selectedNotes.length === 0}
            />
            <Text
              style={styles.editMenuButtonText}
              customTextColor={colors[theme].text}
              disabled={selectedNotes.length === 0}
            >
              Move
            </Text>
          </TouchableOpacity>
        </MotiView>
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

      <BottomDrawerConfirm
        ref={bottomDeleteMultipleDrawerRef}
        title="Delete selected notes?"
        description={`This notes will be permanently deleted from this device. You have selected ${selectedNotes.length} notes.`}
        submitButtonText="Delete"
        onSubmit={handleDeleteMultipleNotes}
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
  editMenuContainer: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    height: 68,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    elevation: 12,
  },
  editMenuButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 4,
    margin: "auto",
  },
  editMenuButtonText: {
    fontSize: 12,
  },
});
