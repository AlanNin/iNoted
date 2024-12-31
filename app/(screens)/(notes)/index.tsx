import { StyleSheet, BackHandler } from "react-native";
import React from "react";
import {
  MotiView,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "@/components/themed";
import colors from "@/constants/colors";
import { router, useNavigation } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createNote, deleteNotes, getAllNotesCustom } from "@/queries/notes";
import NoteCard from "@/components/note_card";
import Loader from "@/components/loading";
import Icon from "@/components/icon";
import useColorScheme from "@/hooks/useColorScheme";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomDrawerSort from "@/components/bottom_drawer_sort";
import BottomDrawerConfirm from "@/components/bottom_drawer_confirm";
import { toast } from "@backpackapp-io/react-native-toast";
import { FlashList } from "@shopify/flash-list";
import { useNotesEditMode } from "@/hooks/useNotesEditMode";
import { DrawerActions } from "@react-navigation/native";
import useAppConfig from "@/hooks/useAppConfig";
import BottomDrawerMoveNote from "@/components/bottom_drawer_move_note";
import { addNotesToNotebook } from "@/queries/notebooks";
import BottomDrawerSelectNotebook from "@/components/bottom_drawer_select_notebook";
import { useNotebooksSelectedToMoveMode } from "@/hooks/useNotebookSelectedToMove";

export default function NotesScreen() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigation = useNavigation();
  const theme = useColorScheme();
  const sortTypes = ["Recently added", "A-Z"] as const;
  const {
    isNotesEditMode,
    toggleNotesEditMode,
    selectedNotes,
    setNotesEditMode,
  } = useNotesEditMode();
  const sortBottomDrawerRef = React.useRef<BottomSheetModal>(null);
  const bottomDeleteMultipleDrawerRef = React.useRef<BottomSheetModal>(null);
  const bottomMoveNoteDrawerRef = React.useRef<BottomSheetModal>(null);
  const bottomSelectNotebookDrawerRef = React.useRef<BottomSheetModal>(null);
  const [selectedNotebook, setSelectedNotebook] = React.useState<number | null>(
    null
  );
  const [notesViewMode, saveNotesViewMode] = useAppConfig<"grid" | "list">(
    "notesViewMode",
    "grid"
  );
  const [notesSortBy, saveNotesSortBy] = useAppConfig<{
    key: typeof sortTypes[number];
    order: "asc" | "desc";
  }>("notesSortBy", { key: sortTypes[0], order: "desc" });
  const [isFirstNote, saveIsFirstNote] = useAppConfig<boolean>(
    "isFirstNote",
    true
  );

  const openMenu = () => {
    setNotesEditMode(false);
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleToggleBottomSelectNotebookDrawer = () => {
    bottomSelectNotebookDrawerRef.current?.present();
  };

  const {
    data: notesData,
    isLoading: isLoadingNotesData,
    refetch: refetchNotes,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: () => getAllNotesCustom(selectedNotebook || undefined),
  });

  async function refetchCalendar() {
    await queryClient.refetchQueries({ queryKey: ["notes_calendar"] });
  }

  React.useEffect(() => {
    refetchNotes();
    refetchCalendar();
  }, [selectedNotebook]);

  const sortedNotes = React.useMemo(() => {
    if (!notesData?.notes) return [];

    const sorted = [...notesData?.notes];

    sorted.sort((a, b) => {
      let compareResult = 0;

      switch (notesSortBy.key) {
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

      return notesSortBy.order === "asc" ? compareResult : -compareResult;
    });

    return sorted;
  }, [notesData, notesSortBy]);

  const filteredNotes = React.useMemo(() => {
    return sortedNotes.filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedNotes, searchQuery]);

  const handleToggleBottomSortDrawer = () => {
    sortBottomDrawerRef.current?.present();
  };

  const toggleSortOrder = (actionTitle: typeof sortTypes[number]) => {
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

  React.useEffect(() => {
    const backAction = () => {
      if (isNotesEditMode) {
        toggleNotesEditMode();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isNotesEditMode]);

  const handleToggleBottomDeleteMultipleDrawer = () => {
    bottomDeleteMultipleDrawerRef.current?.present();
  };

  const handleToggleBottomMoveNoteDrawer = () => {
    bottomMoveNoteDrawerRef.current?.present();
  };

  async function refetchNotebooks() {
    await queryClient.refetchQueries({ queryKey: ["notebook"] });
  }

  const handleDeleteMultipleNotes = React.useCallback(async () => {
    try {
      await deleteNotes(selectedNotes);
      refetchNotes();
      refetchCalendar();
      refetchNotebooks();
      toggleNotesEditMode();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }, [selectedNotes, toggleNotesEditMode]);

  const handleMoveMultipleNotes = React.useCallback(
    async (notebookId: number | undefined, isUncategorized?: boolean) => {
      try {
        await addNotesToNotebook({
          noteIds: selectedNotes,
          notebookId: notebookId,
          isUncategorized: isUncategorized,
        });
        refetchNotes();
        refetchCalendar();
        refetchNotebooks();
        toast.success("Moved successfully");
        toggleNotesEditMode();
      } catch (error) {
        toast.error("An error occurred. Please try again.");
      }
    },
    [selectedNotes]
  );

  const handleCreateNote = async () => {
    const newNote = await createNote({
      title: "",
      content: "",
    });

    if (isFirstNote) {
      saveIsFirstNote(false);
    }

    router.push(`./${newNote[0].id}`);
  };

  const renderItem = ({ item, index }: { item: NoteProps; index: number }) => (
    <NoteCard
      key={`${item.id}-${item.title}-${item.content}`}
      note={item}
      viewMode={notesViewMode}
      index={index}
    />
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View
            style={styles.searchContainer}
            customBackgroundColor={colors[theme].foggier}
          >
            <TouchableOpacity onPress={openMenu}>
              <Icon name="Menu" strokeWidth={1.8} />
            </TouchableOpacity>

            <TextInput
              style={styles.searchInput}
              placeholder="Find your notes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {notesViewMode === "grid" ? (
              <TouchableOpacity
                onPress={() => saveNotesViewMode("list")}
                disabled={notesData?.notes?.length === 0}
              >
                <Icon
                  name="LayoutGrid"
                  muted={notesData?.notes?.length === 0}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => saveNotesViewMode("grid")}
                disabled={notesData?.notes?.length === 0}
              >
                <Icon name="Rows3" muted={notesData?.notes?.length === 0} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.subHeader}>
            <TouchableOpacity
              style={styles.notesCountContainer}
              onPress={handleToggleBottomSelectNotebookDrawer}
            >
              <Text
                style={styles.notesCount}
                customTextColor={colors[theme].grayscale}
              >
                {notesData?.notebookName
                  ? notesData?.notebookName
                  : "All Notes"}{" "}
                ({isLoadingNotesData ? "..." : notesData?.notes?.length})
              </Text>
              <Icon
                name="ChevronDown"
                size={16}
                customColor={colors[theme].grayscale}
                style={styles.notesCountIcon}
              />
            </TouchableOpacity>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleToggleBottomSortDrawer}
                disabled={notesData?.notes?.length === 0}
              >
                <Icon
                  name="ArrowDownUp"
                  size={16}
                  grayscale
                  muted={notesData?.notes?.length === 0}
                />
                <Text
                  style={styles.actionText}
                  customTextColor={colors[theme].grayscale}
                  disabled={notesData?.notes?.length === 0}
                >
                  Sort
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                disabled={notesData?.notes?.length === 0}
                onPress={toggleNotesEditMode}
              >
                <Icon
                  name={isNotesEditMode ? "PenOff" : "SquarePen"}
                  size={16}
                  grayscale
                  muted={notesData?.notes?.length === 0}
                />
                <Text
                  style={styles.actionText}
                  customTextColor={colors[theme].grayscale}
                  disabled={notesData?.notes?.length === 0}
                >
                  {isNotesEditMode ? "Cancel Edit" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View
          style={[styles.content, { paddingBottom: isNotesEditMode ? 68 : 0 }]}
        >
          {isLoadingNotesData ? (
            <View style={styles.loadingContainer}>
              <Loader />
              <Text style={styles.loadingText}>Loading notes...</Text>
            </View>
          ) : (
            <>
              {filteredNotes!.length > 0 ? (
                <FlashList
                  showsVerticalScrollIndicator={false}
                  key={notesViewMode}
                  keyExtractor={(item, index) =>
                    item.id ? item.id?.toString() : `placeholder-${index}`
                  }
                  data={filteredNotes}
                  renderItem={renderItem}
                  numColumns={notesViewMode === "grid" ? 3 : 1}
                  removeClippedSubviews={true}
                  estimatedItemSize={notesViewMode === "grid" ? 212 : 140}
                />
              ) : (
                <View style={styles.noNotesContainer}>
                  <Icon name="Microscope" size={24} strokeWidth={1} muted />
                  <Text style={styles.noNotesText} disabled>
                    No notes found
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {!isLoadingNotesData && !isNotesEditMode && (
          <View style={styles.addButtonContainer}>
            {notesData?.notes?.length === 0 && isFirstNote && (
              <Text style={styles.emptyText}>
                Let's start by creating your first{" "}
                <Text
                  style={[
                    styles.emptyTextHighlight,
                    { color: colors[theme].primary },
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
              {notesData?.notes?.length === 0 && isFirstNote && (
                <Icon name="Spline" themed size={36} style={styles.spline} />
              )}
              <TouchableOpacity
                style={styles.fab}
                customBackgroundColor={colors[theme].primary}
                onPress={handleCreateNote}
              >
                <Icon name="Plus" size={28} customColor={colors.dark.tint} />
              </TouchableOpacity>
            </MotiView>
          </View>
        )}

        {isNotesEditMode && (
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
              onPress={handleToggleBottomMoveNoteDrawer}
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
      </SafeAreaView>
      <BottomDrawerSort
        ref={sortBottomDrawerRef}
        title="Sort your notes"
        actions={sortTypes.map((type) => ({
          title: type,
          action: () => toggleSortOrder(type),
          isSelected: notesSortBy.key === type,
          order: notesSortBy.order,
        }))}
      />

      <BottomDrawerConfirm
        ref={bottomDeleteMultipleDrawerRef}
        title="Delete selected notes?"
        description={`This notes will be permanently deleted from this device. You have selected ${selectedNotes.length} notes.`}
        submitButtonText="Delete"
        onSubmit={handleDeleteMultipleNotes}
      />

      <BottomDrawerMoveNote
        ref={bottomMoveNoteDrawerRef}
        title="Move notes"
        description={`Make your selected notes part of a notebook.`}
        onSubmit={handleMoveMultipleNotes}
      />

      <BottomDrawerSelectNotebook
        ref={bottomSelectNotebookDrawerRef}
        title="Select notebook"
        description={`Choose a notebook to show your notes from.`}
        setSelectedNotebook={setSelectedNotebook}
        isNotebookSelected={selectedNotebook ? true : false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100%",
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
    height: 48,
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
  notesCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  notesCount: {
    fontSize: 14,
  },
  notesCountIcon: {
    marginTop: 2,
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
    paddingHorizontal: 8,
  },
  emptyText: {
    paddingHorizontal: 8,
    letterSpacing: 0.5,
    maxWidth: 320,
  },
  emptyTextHighlight: {
    letterSpacing: 0.5,
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
    elevation: 2,
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
    marginBottom: "30%",
  },
  loadingText: {
    fontSize: 16,
    alignSelf: "center",
  },
  noNotesContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
    marginBottom: "30%",
  },
  noNotesText: {
    fontSize: 16,
    alignSelf: "center",
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
