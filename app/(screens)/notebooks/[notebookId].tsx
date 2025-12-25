import Icon from "@/components/icon";
import { MotiView, Text, TouchableOpacity, View } from "@/components/themed";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import {
  addNotesToNotebook,
  deleteNotebook,
  getNotebookById,
  removeNoteFromNotebook,
  updateNotebook,
} from "@/queries/notebooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { BackHandler, NativeScrollEvent, StyleSheet } from "react-native";
import { ScrollView, Pressable } from "react-native-gesture-handler";
import { Image } from "expo-image";
import NotebookCard from "@/components/notebook_card";
import { formatMediumDate } from "@/lib/format_date";
import { LinearGradient } from "expo-linear-gradient";
import NoteCard from "@/components/note_card";
import { FlashList } from "@shopify/flash-list";
import { createNote } from "@/queries/notes";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomDrawerConfirm from "@/components/drawers/bottom_drawer_confirm";
import { toast } from "@backpackapp-io/react-native-toast";
import BottomDrawerEditNotebook from "@/components/drawers/bottom_drawer_edit_notebook";
import { useNotesEditMode } from "@/hooks/useNotesEditMode";
import BottomDrawerMoveNote from "@/components/drawers/bottom_drawer_move_note";
import { useConfig } from "@/providers/config";
import { sortTypes } from "@/types/bottom_drawer_sort";
import BottomDrawerSort from "@/components/drawers/bottom_drawer_sort";
import { NewNotebookProps } from "@/types/notebooks";
import { NoteProps } from "@/types/notes";

const MemoizedNoteCard = React.memo(NoteCard);

export default function NotebookScreen() {
  const { notebookId } = useLocalSearchParams();
  const [isMoreModalOpen, setIsMoreModalOpen] = React.useState(false);
  const [isScrollOnTop, setIsScrollOnTop] = React.useState(true);
  const bottomEditNotebookDrawerRef = React.useRef<BottomSheetModal>(null);
  const bottomDeleteNotebookDrawerRef = React.useRef<BottomSheetModal>(null);
  const bottomRemoveNotesDrawerRef = React.useRef<BottomSheetModal>(null);
  const bottomMoveNotesDrawerRef = React.useRef<BottomSheetModal>(null);
  const bottomSortNotesDrawerRef = React.useRef<BottomSheetModal>(null);
  const queryClient = useQueryClient();
  const theme = useColorScheme();
  const [isFirstNote, saveIsFirstNote] = useConfig<boolean>(
    "isFirstNote",
    true
  );
  const [notesViewMode] = useConfig<"grid" | "list">("notesViewMode", "grid");
  const [notebooksNotesSortBy, saveNotebooksNotesSortBy] = useConfig<{
    key: (typeof sortTypes)[number];
    order: "asc" | "desc";
  }>(`notebookNotesSortBy-${notebookId}`, {
    key: sortTypes[0],
    order: "desc",
  });
  const {
    isNotesEditMode,
    toggleNotesEditMode,
    selectedNotes,
    setNotesEditMode,
  } = useNotesEditMode();

  const { data: notebookData, isLoading: isLoadingNotebookData } = useQuery({
    queryKey: ["notebook", Number(notebookId)],
    queryFn: () => getNotebookById(Number(notebookId)),
    enabled: !!notebookId,
  });

  const sortedNotebookNotes = React.useMemo(() => {
    const notes = notebookData?.notes ?? [];
    if (notes.length === 0) return notes;

    const sorted = [...notes];

    sorted.sort((a, b) => {
      let compareResult = 0;

      switch (notebooksNotesSortBy.key) {
        case sortTypes[0]:
          compareResult =
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;

        case sortTypes[1]:
          compareResult =
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          break;

        case sortTypes[2]:
          compareResult = (a.title ?? "").localeCompare(
            b.title ?? "",
            undefined,
            {
              sensitivity: "base",
              numeric: true,
            }
          );
          break;

        default:
          compareResult = 0;
      }

      return notebooksNotesSortBy.order === "asc"
        ? compareResult
        : -compareResult;
    });

    return sorted;
  }, [notebookData?.notes, notebooksNotesSortBy]);

  const isBackgroundAColor =
    typeof notebookData?.background === "string" &&
    notebookData?.background.includes("#");

  const colorSource = isLoadingNotebookData
    ? colors.dark.grayscale
    : isBackgroundAColor
    ? notebookData?.background
    : "transparent";

  const imageSource =
    typeof notebookData?.background === "string" &&
    notebookData?.background.startsWith("file:")
      ? { uri: notebookData?.background }
      : (notebookData?.background as any);

  async function refetchNotebooks() {
    await queryClient.refetchQueries({ queryKey: ["notebooks"] });
    await queryClient.refetchQueries({ queryKey: ["notebook"] });
  }

  async function refetchNotes() {
    await queryClient.refetchQueries({ queryKey: ["notes"] });
    await queryClient.refetchQueries({ queryKey: ["note"] });
  }

  function getDifumColor(opacity: number) {
    const difuminationColor =
      theme === "light" ? "242, 243, 244" : "15, 15, 15";

    return `rgba(${difuminationColor}, ${opacity})`;
  }

  const renderItem = React.useCallback(
    ({ item }: { item: NoteProps; index: number }) => (
      <MemoizedNoteCard
        key={`${item.id}-${item.title}-${item.content}`}
        note={item}
        viewMode={notesViewMode}
      />
    ),
    [notesViewMode]
  );

  const handleScroll = React.useCallback(
    ({ nativeEvent }: { nativeEvent: NativeScrollEvent }) => {
      const isTop = nativeEvent.contentOffset.y <= 0;
      if (isTop !== isScrollOnTop) {
        setIsScrollOnTop(isTop);
      }
    },
    [isScrollOnTop]
  );

  const handleNewNote = async () => {
    const newNote = await createNote({
      title: "",
      content: "",
      notebook_id: notebookData?.id || null,
    });

    if (isFirstNote) {
      saveIsFirstNote(false);
    }

    router.push(`${newNote[0].id}`);
  };

  const handleToggleBottomEditNotebookDrawer = () => {
    setIsMoreModalOpen(false);
    bottomEditNotebookDrawerRef.current?.present();
  };

  async function handleUpdateNotebook(notebook: NewNotebookProps) {
    const { id, ...notebookData } = notebook;

    try {
      await updateNotebook(id!, notebookData);
      await refetchNotebooks();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }

  const handleToggleBottomDeleteNotebookDrawer = () => {
    setIsMoreModalOpen(false);
    bottomDeleteNotebookDrawerRef.current?.present();
  };

  const handleDeleteNotebook = async () => {
    try {
      await deleteNotebook(Number(notebookId));
      refetchNotebooks();
      router.back();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleToggleBottomRemoveNotesDrawer = () => {
    bottomRemoveNotesDrawerRef.current?.present();
  };

  const handleRemoveNoteFromNotebook = async () => {
    await removeNoteFromNotebook({ noteIds: selectedNotes });
    refetchNotebooks();
    refetchNotes();
    setNotesEditMode(false);
  };

  const handleToggleBottomMoveNotesDrawer = () => {
    bottomMoveNotesDrawerRef.current?.present();
  };

  const handleMoveMultipleNotes = async (
    notebookId: number | undefined,
    isUncategorized?: boolean
  ) => {
    try {
      toggleNotesEditMode();
      await addNotesToNotebook({
        noteIds: selectedNotes,
        notebookId: notebookId,
        isUncategorized: isUncategorized,
      });
      refetchNotes();
      refetchNotebooks();
      toast.success("Moved successfully");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleSaveNotebookNotesSortOrder = (sort: any) => {
    saveNotebooksNotesSortBy(sort);
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

  if (isLoadingNotebookData) {
    return null;
  }

  return (
    <>
      <View
        style={[styles.container, { paddingBottom: isNotesEditMode ? 68 : 0 }]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          scrollEventThrottle={500}
          onScroll={handleScroll}
          contentContainerStyle={{
            minHeight: "100%",
          }}
        >
          <Pressable onPressIn={() => setIsMoreModalOpen(false)}>
            <MotiView
              style={[styles.header, { borderColor: colors[theme].foggier }]}
              animate={{
                backgroundColor: isScrollOnTop
                  ? "transparent"
                  : colors[theme].background,
                borderBottomWidth: isScrollOnTop ? 0 : 1,
              }}
              transition={{
                type: "timing",
                duration: 100,
              }}
            >
              <TouchableOpacity
                style={styles.headerButton}
                customBackgroundColor={
                  isScrollOnTop ? "rgba(0,0,0,0.5)" : colors[theme].background
                }
                onPress={() => router.back()}
              >
                <Icon
                  name="ArrowLeft"
                  size={20}
                  customColor={
                    isScrollOnTop ? colors.dark.tint : colors[theme].tint
                  }
                />
              </TouchableOpacity>

              <View
                style={styles.moreContainer}
                customBackgroundColor="transparent"
              >
                <Pressable>
                  <TouchableOpacity
                    style={styles.headerButton}
                    customBackgroundColor={
                      isScrollOnTop
                        ? "rgba(0,0,0,0.5)"
                        : colors[theme].background
                    }
                    onPress={() => {
                      setIsMoreModalOpen(!isMoreModalOpen);
                    }}
                  >
                    <Icon
                      name="EllipsisVertical"
                      size={20}
                      customColor={
                        isScrollOnTop ? colors.dark.tint : colors[theme].tint
                      }
                    />
                  </TouchableOpacity>
                </Pressable>
                {isMoreModalOpen && (
                  <Pressable>
                    <MotiView
                      style={styles.moreModal}
                      customBackgroundColor={colors[theme].grayscale_light}
                      from={{ opacity: 0, translateY: -10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{
                        type: "timing",
                        duration: 150,
                      }}
                    >
                      <TouchableOpacity
                        style={styles.moreModalButton}
                        onPress={handleToggleBottomEditNotebookDrawer}
                      >
                        <Icon name="PenLine" strokeWidth={1.2} size={18} />
                        <Text style={styles.moreModalButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.moreModalButton}
                        onPress={() => {
                          setIsMoreModalOpen(false);
                          toggleNotesEditMode();
                        }}
                        disabled={notebookData?.notes.length === 0}
                      >
                        <Icon
                          name="LibraryBig"
                          strokeWidth={1.2}
                          size={18}
                          muted={notebookData?.notes.length === 0}
                        />
                        <Text
                          style={styles.moreModalButtonText}
                          disabled={notebookData?.notes.length === 0}
                        >
                          {isNotesEditMode ? "Cancel" : "Manage Notes"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.moreModalButton}
                        onPress={() => {
                          setIsMoreModalOpen(false);
                          bottomSortNotesDrawerRef.current?.present();
                        }}
                        disabled={notebookData?.notes.length === 0}
                      >
                        <Icon
                          name="ArrowDownUp"
                          strokeWidth={1.2}
                          size={18}
                          muted={notebookData?.notes.length === 0}
                        />
                        <Text
                          style={styles.moreModalButtonText}
                          disabled={notebookData?.notes.length === 0}
                        >
                          Sort Notes
                        </Text>
                      </TouchableOpacity>

                      <View
                        style={styles.moreModalDivider}
                        customBackgroundColor={colors[theme].foggiest}
                      />
                      <TouchableOpacity
                        style={[styles.moreModalButton]}
                        onPress={handleToggleBottomDeleteNotebookDrawer}
                      >
                        <Icon
                          name="Eraser"
                          strokeWidth={1.2}
                          size={18}
                          customColor={colors[theme].danger}
                        />
                        <Text
                          customTextColor={colors[theme].danger}
                          style={styles.moreModalButtonText}
                        >
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </MotiView>
                  </Pressable>
                )}
              </View>
            </MotiView>
          </Pressable>
          <Pressable
            onPressIn={() => setIsMoreModalOpen(false)}
            style={{ backgroundColor: colors[theme].background }}
          >
            <View style={styles.difumBackgroundContainer}>
              {isBackgroundAColor ? (
                <LinearGradient
                  colors={[colorSource, colors[theme].background]}
                  style={styles.backgroundImage}
                />
              ) : (
                <>
                  <Image
                    source={imageSource}
                    style={styles.backgroundImage}
                    blurRadius={2}
                  />
                  <View style={styles.overlay} />
                </>
              )}
              <LinearGradient
                colors={[
                  getDifumColor(1),
                  getDifumColor(0.8),
                  getDifumColor(0.5),
                  getDifumColor(0.2),
                  getDifumColor(0),
                ]}
                style={styles.gradientTop}
              />
              <LinearGradient
                colors={[
                  getDifumColor(0),
                  getDifumColor(0.2),
                  getDifumColor(0.5),
                  getDifumColor(0.8),
                  getDifumColor(1),
                ]}
                style={styles.gradientBottom}
              />
            </View>
          </Pressable>
          <Pressable onPressIn={() => setIsMoreModalOpen(false)}>
            <View
              style={styles.photoAndTitleContainer}
              customBackgroundColor="transparent"
            >
              <View
                customBackgroundColor="transparent"
                style={{ marginBottom: -16, marginHorizontal: -8 }}
              >
                <Pressable onPressIn={() => setIsMoreModalOpen(false)}>
                  <NotebookCard
                    notebook={{
                      name: notebookData?.name || "Untitled",
                      background: isBackgroundAColor
                        ? colorSource
                        : imageSource,
                    }}
                    isAdding
                    isLoading={isLoadingNotebookData}
                    onPress={() => {}}
                    disabled={true}
                    numberOfLinesName={2}
                    mini={true}
                    showName={false}
                  />
                </Pressable>
              </View>
              <View
                style={styles.nameContainer}
                customBackgroundColor="transparent"
              >
                <Text style={styles.name}>
                  {notebookData?.name || "Untitled"}
                </Text>
                <Text style={styles.creation}>
                  Created on {formatMediumDate(notebookData?.created_at || "")}
                </Text>
              </View>
            </View>
          </Pressable>

          <Pressable onPressIn={() => setIsMoreModalOpen(false)}>
            <View style={styles.detailsContainer}>
              <View style={styles.detail}>
                <Icon
                  name="CalendarClock"
                  size={20}
                  customColor={colors[theme].grayscale}
                />
                <Text
                  style={styles.detailTxt}
                  customTextColor={colors[theme].grayscale}
                >
                  {formatMediumDate(notebookData?.updated_at || "")}
                </Text>
              </View>
              <View style={styles.detail}>
                <Icon
                  name="NotepadText"
                  size={20}
                  customColor={colors[theme].grayscale}
                />
                <Text
                  style={styles.detailTxt}
                  customTextColor={colors[theme].grayscale}
                >
                  {notebookData?.notes.length} notes
                </Text>
              </View>
              <TouchableOpacity style={styles.detail} onPress={handleNewNote}>
                <Icon
                  name="CirclePlus"
                  size={20}
                  customColor={colors[theme].grayscale}
                />
                <Text
                  style={styles.detailTxt}
                  customTextColor={colors[theme].grayscale}
                >
                  New Note
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>

          {notebookData && notebookData.notes.length > 0 ? (
            <Pressable onPressIn={() => setIsMoreModalOpen(false)}>
              <Text style={styles.notesTxt} disabled>
                Your notes
              </Text>
              <View style={styles.notesContainer}>
                <FlashList
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item, index) =>
                    item.id ? item.id?.toString() : `placeholder-${index}`
                  }
                  data={sortedNotebookNotes}
                  renderItem={renderItem}
                  numColumns={notesViewMode === "grid" ? 3 : 1}
                  removeClippedSubviews={true}
                  key={notesViewMode}
                />
              </View>
            </Pressable>
          ) : (
            <View
              style={styles.noNotesContainer}
              onTouchStart={() => setIsMoreModalOpen(false)}
            >
              <Pressable
                onPressIn={() => setIsMoreModalOpen(false)}
                style={styles.noNotesContainer}
              >
                <Icon name="Microscope" size={24} strokeWidth={1} muted />
                <Text style={styles.noNotesText} disabled>
                  No notes found
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
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
              onPress={handleToggleBottomRemoveNotesDrawer}
              disabled={selectedNotes.length === 0}
            >
              <Icon
                name="BookX"
                size={24}
                strokeWidth={1}
                muted={selectedNotes.length === 0}
              />
              <Text
                style={styles.editMenuButtonText}
                customTextColor={colors[theme].text}
                disabled={selectedNotes.length === 0}
              >
                Remove
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editMenuButton}
              onPress={handleToggleBottomMoveNotesDrawer}
              disabled={selectedNotes.length === 0}
            >
              <Icon
                name="BookCopy"
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
      </View>
      <BottomDrawerSort
        ref={bottomSortNotesDrawerRef}
        title="Sort Your Notes"
        options={[sortTypes[0], sortTypes[1], sortTypes[2]]}
        selectedSort={notebooksNotesSortBy}
        handleSortOrder={handleSaveNotebookNotesSortOrder}
      />

      <BottomDrawerConfirm
        ref={bottomDeleteNotebookDrawerRef}
        title="Delete This Notebook?"
        description="This notebook will be permanently deleted from this device."
        submitButtonText="Delete"
        onSubmit={handleDeleteNotebook}
      />
      <BottomDrawerEditNotebook
        ref={bottomEditNotebookDrawerRef}
        notebookId={Number(notebookId)}
        onSubmit={handleUpdateNotebook}
      />
      <BottomDrawerConfirm
        ref={bottomRemoveNotesDrawerRef}
        title="Remove selected notes from this notebook?"
        description={`The selected notes will be removed from this notebook. You have selected ${selectedNotes.length} notes.`}
        submitButtonText="Remove"
        onSubmit={handleRemoveNoteFromNotebook}
      />
      <BottomDrawerMoveNote
        ref={bottomMoveNotesDrawerRef}
        title="Move notes"
        description={`Make your selected notes part of a notebook.`}
        onSubmit={handleMoveMultipleNotes}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    padding: 16,
  },
  difumBackgroundContainer: {
    position: "relative",
    minHeight: 220,
    width: "100%",
    marginTop: -1,
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  gradientTop: {
    position: "absolute",
    top: 0,
    width: "100%",
    minHeight: 20,
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    minHeight: 20,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: 16,
    paddingTop: 28,
    paddingHorizontal: 24,
    marginBottom: -75,
  },
  headerButton: {
    padding: 6,
    borderRadius: 9999,
  },
  photoAndTitleContainer: {
    position: "absolute",
    bottom: -80,
    left: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    width: "100%",
    padding: 16,
    gap: 20,
  },
  nameContainer: {
    paddingVertical: 12,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  creation: {
    fontSize: 12,
  },
  moreContainer: {
    position: "relative",
  },
  detailsContainer: {
    marginTop: 88,
    padding: 16,
    paddingBottom: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  detail: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 1,
  },
  detailTxt: {
    fontSize: 12,
  },
  notesTxt: {
    textAlign: "center",
    marginVertical: 24,
  },
  notesContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  moreModal: {
    position: "absolute",
    right: 4,
    top: 4,
    borderRadius: 8,
    zIndex: 10,
    width: 152,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    overflow: "hidden",
  },
  moreModalButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 1,
  },
  moreModalButtonText: {
    fontSize: 14,
  },
  moreModalDivider: {
    height: 1,
  },
  noNotesContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
    paddingBottom: 40,
    width: "100%",
  },
  noNotesText: {
    fontSize: 16,
    alignSelf: "center",
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
