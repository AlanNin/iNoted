import {
  StyleSheet,
  TouchableWithoutFeedback,
  BackHandler,
  Share,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  AppStateStatus,
  AppState,
} from "react-native";
import useColorScheme from "@/hooks/useColorScheme";
import React from "react";
import {
  MarkdownTextInput,
  MotiView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "@/components/themed";
import colors from "@/constants/colors";
import { router, useLocalSearchParams } from "expo-router";
import { formatLongDate } from "@/lib/format_date";
import {
  deleteNote,
  getNoteById,
  updateNote,
  upsertNote,
} from "@/queries/notes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Icon from "@/components/icon";
import Loader from "@/components/loading";
import { parseExpensiMark } from "@expensify/react-native-live-markdown";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { toast } from "@backpackapp-io/react-native-toast";
import BottomDrawerConfirm from "@/components/bottom_drawer_confirm";
import BottomDrawerMoveNote from "@/components/bottom_drawer_move_note";
import { addNotesToNotebook } from "@/queries/notebooks";
import { debounce } from "lodash";

export default function NoteScreen() {
  const note = useLocalSearchParams();
  const theme = useColorScheme();
  const undoStack = React.useRef<NewNoteProps[]>([]);
  const redoStack = React.useRef<NewNoteProps[]>([]);
  const queryClient = useQueryClient();
  const [inputs, setInputs] = React.useState<NewNoteProps>({
    title: "",
    content: "",
  });
  const [isMoreModalOpen, setIsMoreModalOpen] = React.useState(false);
  const bottomDrawerRef = React.useRef<BottomSheetModal>(null);
  const bottomMoveNoteDrawerRef = React.useRef<BottomSheetModal>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);

  const { data: noteData, isLoading: isLoadingNoteData } = useQuery({
    queryKey: ["note", Number(note.noteId)],
    queryFn: () => getNoteById(Number(note.noteId)),
    enabled: !!note.noteId,
  });

  const noteDate = noteData?.updated_at;

  React.useEffect(() => {
    setInputs({
      title: noteData?.title || "",
      content: noteData?.content || "",
    });
  }, [noteData]);

  React.useEffect(() => {
    const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });

    const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const handleHideKeyboard = () => {
    if (isMoreModalOpen) {
      setIsMoreModalOpen(false);
    }
    Keyboard.dismiss();
  };

  function handleInputChange(name: keyof NewNoteProps, value: string) {
    const saveToUndoStack = debounce(() => {
      undoStack.current.push({ ...inputs });
      redoStack.current = [];
    }, 500);

    if (undoStack.current.length > 0) {
      saveToUndoStack();
    } else {
      undoStack.current.push({ ...inputs });
      redoStack.current = [];
    }

    setInputs((prev) => ({ ...prev, [name]: value }));
  }

  function handleUndo() {
    if (isMoreModalOpen) {
      setIsMoreModalOpen(false);
    }
    if (undoStack.current.length > 0) {
      const previousState = undoStack.current.pop()!;
      redoStack.current.push({ ...inputs });
      setInputs(previousState);
    }
  }

  function handleRedo() {
    if (isMoreModalOpen) {
      setIsMoreModalOpen(false);
    }

    if (redoStack.current.length > 0) {
      const nextState = redoStack.current.pop()!;
      undoStack.current.push({ ...inputs });
      setInputs(nextState);
    }
  }

  async function refetchNotes() {
    await queryClient.refetchQueries({ queryKey: ["notes"] });
  }

  async function refetchNotebooks() {
    await queryClient.refetchQueries({ queryKey: ["notebook"] });
  }

  const noChanges =
    inputs.title === noteData?.title && inputs.content === noteData?.content;

  const handlePresentModalPress = React.useCallback(() => {
    Keyboard.dismiss();
    setIsMoreModalOpen(false);
    bottomDrawerRef.current?.present();
  }, []);

  async function handleDeleteNote() {
    try {
      await deleteNote(Number(note.noteId));
      refetchNotes();
      refetchNotebooks();
      router.back();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }

  async function handleUpdateNote() {
    if (inputs.content.length === 0) {
      handleDeleteNote();
      return;
    }

    if (noChanges) {
      router.back();
      return;
    }

    try {
      await updateNote(Number(note.noteId), {
        ...inputs,
        title: inputs.title.length === 0 ? "Untitled note" : inputs.title,
      });

      refetchNotes();
      router.back();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }

  async function handleShareNote() {
    try {
      setIsMoreModalOpen(false);

      const message = `${inputs.title || "Untitled Note"}\n\n${inputs.content}`;

      await Share.share({
        title: inputs.title || "Untitled Note",
        message: message,
      });
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }

  const handleToggleBottomMoveNoteDrawer = () => {
    Keyboard.dismiss();
    setIsMoreModalOpen(false);
    bottomMoveNoteDrawerRef.current?.present();
  };

  const handleMoveNote = async (notebookId: number) => {
    try {
      await addNotesToNotebook({ noteIds: [Number(note.noteId)], notebookId });
      refetchNotebooks();
      refetchNotes();
      setIsMoreModalOpen(false);
      toast.success("Moved successfully");
    } catch (error) {
      console.error("Error moving notes:", error);
      toast.error(
        "An error occurred while moving the notes. Please try again."
      );
    }
  };

  // save note on back press button
  async function handleBack() {
    if (isMoreModalOpen) {
      setIsMoreModalOpen(false);
    }
    await handleUpdateNote();
  }

  // save note on back press
  React.useEffect(() => {
    const backAction = async () => {
      if (isMoreModalOpen) {
        setIsMoreModalOpen(false);
        return true;
      }

      if (inputs.content.length === 0) {
        router.back();
        return true;
      }

      try {
        await handleUpdateNote();
        return true;
      } catch (error) {
        toast.error("Failed to save note. Please try again.");
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        backAction();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [inputs, isMoreModalOpen]);

  React.useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        if (inputs.content.length > 0) {
          await handleUpdateNote();
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [inputs]);

  if (isLoadingNoteData) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
        <Text style={styles.loadingText}>Loading note...</Text>
      </View>
    );
  }
  return (
    <>
      <TouchableWithoutFeedback
        style={styles.container}
        onPress={() => setIsMoreModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}
        >
          <View style={styles.wrapper}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.button} onPress={handleBack}>
                <Icon name="ArrowLeft" />
              </TouchableOpacity>
              <View style={styles.headerSecton}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleUndo}
                  disabled={undoStack.current.length === 0}
                >
                  <Icon name="Undo2" muted={undoStack.current.length === 0} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleRedo}
                  disabled={redoStack.current.length === 0}
                >
                  <Icon name="Redo2" muted={redoStack.current.length === 0} />
                </TouchableOpacity>
                {isKeyboardVisible && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleHideKeyboard}
                  >
                    <Icon name="Check" />
                  </TouchableOpacity>
                )}
                <View style={styles.moreContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      setIsMoreModalOpen(!isMoreModalOpen);
                    }}
                  >
                    <Icon name="EllipsisVertical" />
                  </TouchableOpacity>
                  {isMoreModalOpen && (
                    <TouchableWithoutFeedback>
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
                          onPress={handleShareNote}
                          disabled={inputs.content.length === 0}
                        >
                          <Icon
                            name="Share2"
                            strokeWidth={1.2}
                            size={18}
                            muted={inputs.content.length === 0}
                          />
                          <Text disabled={inputs.content.length === 0}>
                            Share
                          </Text>
                        </TouchableOpacity>
                        <View
                          style={styles.moreModalDivider}
                          customBackgroundColor={colors[theme].foggiest}
                        />
                        <TouchableOpacity
                          style={styles.moreModalButton}
                          onPress={handleToggleBottomMoveNoteDrawer}
                          disabled={inputs.content.length === 0}
                        >
                          <Icon
                            name="NotebookPen"
                            strokeWidth={1.2}
                            size={18}
                            muted={inputs.content.length === 0}
                          />
                          <Text disabled={inputs.content.length === 0}>
                            Move
                          </Text>
                        </TouchableOpacity>
                        <View
                          style={styles.moreModalDivider}
                          customBackgroundColor={colors[theme].foggiest}
                        />
                        <TouchableOpacity
                          style={[
                            styles.moreModalButton,
                            inputs.content.length === 0 && { display: "none" },
                          ]}
                          onPress={handlePresentModalPress}
                        >
                          <Icon
                            name="Eraser"
                            strokeWidth={1.2}
                            size={18}
                            customColor={colors[theme].primary}
                          />
                          <Text customTextColor={colors[theme].primary}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </MotiView>
                    </TouchableWithoutFeedback>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.content}>
              <Text
                style={styles.lastEditedText}
                customTextColor={colors[theme].grayscale}
              >
                Last edited on {formatLongDate(noteDate!)}
              </Text>
              <TextInput
                value={inputs.title}
                onChangeText={(e) => handleInputChange("title", e)}
                style={[styles.noteTitle]}
                placeholder="Untitled note"
                onPress={() => setIsMoreModalOpen(false)}
              />
              <MarkdownTextInput
                value={inputs.content}
                onChangeText={(e) => handleInputChange("content", e)}
                multiline={true}
                style={[styles.noteContent]}
                placeholder="Capture your thoughts..."
                parser={parseExpensiMark}
                onPress={() => setIsMoreModalOpen(false)}
                autoFocus={noteData?.content.length === 0}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <BottomDrawerConfirm
        ref={bottomDrawerRef}
        title="Delete this note?"
        description="This note will be permanently deleted from this device."
        submitButtonText="Delete"
        onSubmit={() => handleDeleteNote()}
      />
      <BottomDrawerMoveNote
        ref={bottomMoveNoteDrawerRef}
        title="Move note"
        description="Make this note part of a notebook."
        onSubmit={handleMoveNote}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerSecton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  button: {
    padding: 4,
  },
  moreContainer: {
    position: "relative",
  },
  moreModal: {
    position: "absolute",
    right: 4,
    top: 36,
    borderRadius: 4,
    zIndex: 10,
    width: 108,
    elevation: 5,
    display: "flex",
    flexDirection: "column",
  },
  moreModalButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 1,
  },
  moreModalDivider: {
    height: 1,
  },
  content: {
    flex: 1,
    flexDirection: "column",
    gap: 16,
    position: "relative",
  },
  lastEditedText: {
    fontSize: 14,
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 0,
    margin: 0,
    textAlignVertical: "top",
    height: 32,
  },
  noteContent: {
    padding: 0,
    margin: 0,
    flex: 1,
    textAlignVertical: "top",
    fontSize: 16,
  },
  noteSave: {
    position: "absolute",
    bottom: 16,
    right: 16,
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
});
