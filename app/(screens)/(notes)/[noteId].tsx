import {
  StyleSheet,
  TouchableWithoutFeedback,
  BackHandler,
  Share,
  Keyboard,
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
import { deleteNote, getNoteById, updateNote } from "@/queries/notes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Icon from "@/components/icon";
import Loader from "@/components/loading";
import { parseExpensiMark } from "@expensify/react-native-live-markdown";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { toast } from "@backpackapp-io/react-native-toast";
import BottomDrawerConfirm from "@/components/bottom_drawer_confirm";

export default function NoteScreen() {
  const note = useLocalSearchParams();
  const theme = useColorScheme();
  const undoStack = React.useRef<NewNoteProps[]>([]);
  const redoStack = React.useRef<NewNoteProps[]>([]);
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const [inputs, setInputs] = React.useState<NewNoteProps>({
    title: "",
    content: "",
  });
  const [isMoreModalOpen, setIsMoreModalOpen] = React.useState(false);
  const bottomDrawerRef = React.useRef<BottomSheetModal>(null);

  const { data: noteData, isLoading: isLoadingNoteData } = useQuery({
    queryKey: ["note", Number(note.noteId)],
    queryFn: () => getNoteById(Number(note.noteId)),
    enabled: note.noteId !== undefined,
  });

  React.useEffect(() => {
    setInputs({
      title: noteData?.title || "",
      content: noteData?.content || "",
    });
  }, [noteData]);

  function handleInputChange(name: keyof NewNoteProps, value: string) {
    if (undoStack.current.length > 0) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        undoStack.current.push({ ...inputs });
        redoStack.current = [];
      }, 500);
    } else {
      undoStack.current.push({ ...inputs });
      redoStack.current = [];
    }

    setInputs((prev) => ({ ...prev, [name]: value }));
  }

  function handleUndo() {
    if (undoStack.current.length > 0) {
      const previousState = undoStack.current.pop()!;
      redoStack.current.push({ ...inputs });
      setInputs(previousState);
    }
  }

  function handleRedo() {
    if (redoStack.current.length > 0) {
      const nextState = redoStack.current.pop()!;
      undoStack.current.push({ ...inputs });
      setInputs(nextState);
    }
  }

  async function refetchNotes() {
    await queryClient.refetchQueries({ queryKey: ["notes"] });
  }

  const isUpdateDisabled =
    inputs.content.length === 0 ||
    (inputs.title === noteData?.title && inputs.content === noteData?.content);

  async function handleUpdateNote() {
    if (isUpdateDisabled) {
      return;
    }

    try {
      await updateNote(Number(note.noteId), {
        ...inputs,
        title: inputs.title.length === 0 ? "Untitled note" : inputs.title,
      });
      await refetchNotes();
      toast.success("Note updated successfully!");
      router.back();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }

  const handlePresentModalPress = React.useCallback(() => {
    Keyboard.dismiss();
    setIsMoreModalOpen(false);
    bottomDrawerRef.current?.present();
  }, []);

  async function handleDeleteNote() {
    try {
      await deleteNote(Number(note.noteId));
      await refetchNotes();
      toast.success("Note deleted successfully!");
      router.back();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }

  async function handleShareNote() {
    try {
      setIsMoreModalOpen(false);

      const message = `${inputs.title}\n\n${inputs.content}`;

      await Share.share({
        title: inputs.title || "Untitled Note",
        message: message,
      });
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }

  React.useEffect(() => {
    const backAction = () => {
      if (isMoreModalOpen) {
        setIsMoreModalOpen(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isMoreModalOpen]);

  if (isLoadingNoteData) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
        <Text style={styles.loadingText}>Loading note...</Text>
      </View>
    );
  }
  return (
    <TouchableWithoutFeedback
      style={styles.container}
      onPress={() => setIsMoreModalOpen(false)}
    >
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.back()}
            >
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
              <TouchableOpacity
                style={styles.button}
                onPress={handleUpdateNote}
                disabled={isUpdateDisabled}
              >
                <Icon name="Save" muted={isUpdateDisabled} />
              </TouchableOpacity>
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
                  // TODO: add move to notebook
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
                      >
                        <Icon name="Share2" strokeWidth={1.2} size={18} />
                        <Text>Share</Text>
                      </TouchableOpacity>
                      <View
                        style={styles.moreModalDivider}
                        customBackgroundColor={colors[theme].foggiest}
                      />
                      <TouchableOpacity
                        style={styles.moreModalButton}
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
              Last edited on {formatLongDate(noteData?.updated_at!)}
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
            />
          </View>
        </View>
        <BottomDrawerConfirm
          ref={bottomDrawerRef}
          title="Delete this note?"
          description="This note will be permanently deleted from this device."
          submitButtonText="Delete"
          onSubmit={() => handleDeleteNote()}
        />
      </View>
    </TouchableWithoutFeedback>
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
