import LexicalEditorComponent from "@/components/lexical";
import { SafeAreaView, View } from "@/components/themed";
import { toast } from "@backpackapp-io/react-native-toast";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  AppState,
  AppStateStatus,
  BackHandler,
  Keyboard,
  Share,
  StyleSheet,
} from "react-native";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { deleteNote, getNoteById, updateNote } from "@/queries/notes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addNotesToNotebook } from "@/queries/notebooks";
import BottomDrawerConfirm from "@/components/bottom_drawer_confirm";
import BottomDrawerMoveNote from "@/components/bottom_drawer_move_note";
import BottomDrawerNoteDetails from "@/components/bottom_drawer_note_details";
import { convertToJson, parseEditorState } from "@/lib/text_editor";
import { getNavigationBarType } from "react-native-navigation-bar-detector";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ToastAndroid } from "react-native";

export default function TestScreen() {
  const theme = useColorScheme();
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);
  const { noteId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [isShowMoreModalOpen, setIsShowMoreModalOpen] = React.useState(false);
  const bottomMoveNoteDrawerRef = React.useRef<BottomSheetModal>(null);
  const bottomNoteDetailsDrawerRef = React.useRef<BottomSheetModal>(null);
  const bottomDeleteNoteDrawerRef = React.useRef<BottomSheetModal>(null);
  const navigationType = getNavigationBarType();

  const { data: noteData, isLoading: isLoadingNoteData } = useQuery({
    queryKey: ["note", Number(noteId)],
    queryFn: () => getNoteById(Number(noteId)),
    enabled: !!noteId,
  });

  const noteDate = noteData?.updated_at;

  const initialContent = convertToJson(noteData?.content);

  const [title, setTitle] = React.useState(noteData?.title ?? "");
  const [content, setContent] = React.useState(initialContent ?? "");

  React.useEffect(() => {
    setTitle(noteData?.title || "");
    setContent(initialContent!);
  }, [noteData]);

  // save note on back press
  React.useEffect(() => {
    const backAction = async () => {
      if (isShowMoreModalOpen) {
        setIsShowMoreModalOpen(false);
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
  }, [title, content, isShowMoreModalOpen]);

  // save note on app state change
  React.useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        if (content.length > 0) {
          await handleUpdateNote({ handleback: false });
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
  }, [title, content]);

  async function refetchNotes() {
    await queryClient.refetchQueries({ queryKey: ["notes"] });
    await queryClient.refetchQueries({ queryKey: ["note"] });
    await queryClient.refetchQueries({ queryKey: ["notes_calendar"] });
  }

  async function refetchNotebooks() {
    await queryClient.refetchQueries({ queryKey: ["notebook"] });
  }

  async function handleShare() {
    try {
      await Share.share({
        title: title,
        message: `${title || "Untitled Note"}\n\n${parseEditorState(content)}`,
      });
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }

  async function handleDeleteNote() {
    try {
      await deleteNote(Number(noteId));
      refetchNotes();
      refetchNotebooks();
      router.back();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }

  async function handleMoveNote(
    notebookId: number | undefined,
    isUncategorized?: boolean
  ) {
    try {
      await addNotesToNotebook({
        noteIds: [Number(noteId)],
        notebookId,
        isUncategorized: isUncategorized,
      });
      refetchNotebooks();
      refetchNotes();
      toast.success("Moved successfully");
    } catch (error) {
      console.error("Error moving notes:", error);
      toast.error(
        "An error occurred while moving the notes. Please try again."
      );
    }
  }

  async function handleUpdateNote(
    { handleback }: { handleback?: boolean } = { handleback: true }
  ) {
    const noChanges = title === noteData?.title && content === initialContent;

    if (noChanges && title.length > 0) {
      if (handleback) {
        router.back();
      }
      return;
    }

    try {
      await updateNote(Number(noteId), {
        title: title.length === 0 ? "Untitled note" : title,
        content,
      });

      refetchNotes();

      if (handleback) {
        router.back();
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }

  const handleToggleBottomMoveNoteDrawer = () => {
    bottomMoveNoteDrawerRef.current?.present();
  };

  const handleToggleBottomNoteDetailsDrawer = () => {
    bottomNoteDetailsDrawerRef.current?.present();
  };

  const handleToggleBottomNoteDeleteDrawer = () => {
    bottomDeleteNoteDrawerRef.current?.present();
  };

  // save note on back press button
  async function handleBack() {
    await setIsKeyboardVisible(false);
    Keyboard.dismiss();
    await handleUpdateNote();
  }

  function handleToastAndroid(message: string) {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }

  if (isLoadingNoteData) {
    return null;
  }

  return (
    <>
      <SafeAreaView
        style={styles.container}
        customBackgroundColor={
          isKeyboardVisible
            ? colors[theme].editor.toolbar_background
            : colors[theme].background
        }
      >
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          onKeyboardDidShow={() => setIsKeyboardVisible(true)}
          onKeyboardDidHide={() => setIsKeyboardVisible(false)}
        >
          <LexicalEditorComponent
            handleBack={handleBack}
            isKeyboardVisible={isKeyboardVisible}
            isShowMoreModalOpen={isShowMoreModalOpen}
            setIsShowMoreModalOpen={setIsShowMoreModalOpen}
            handleShare={handleShare}
            handleToggleBottomMoveNoteDrawer={handleToggleBottomMoveNoteDrawer}
            handleToggleBottomNoteDetailsDrawer={
              handleToggleBottomNoteDetailsDrawer
            }
            handleToggleBottomNoteDeleteDrawer={
              handleToggleBottomNoteDeleteDrawer
            }
            setTitle={setTitle}
            setContent={setContent}
            title={title}
            content={initialContent!}
            noteDate={noteDate!}
            navigationType={navigationType}
            handleToastAndroid={handleToastAndroid}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>

      <BottomDrawerConfirm
        ref={bottomDeleteNoteDrawerRef}
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
      <BottomDrawerNoteDetails
        ref={bottomNoteDetailsDrawerRef}
        note={noteData}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
    position: "absolute",
    inset: 0,
  },
  loadingText: {
    fontSize: 16,
    alignSelf: "center",
    marginBottom: 56,
  },
});
