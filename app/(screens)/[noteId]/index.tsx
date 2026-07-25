import LexicalEditorComponent from "@/components/lexical";
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
import BottomDrawerConfirm from "@/components/drawers/bottom_drawer_confirm";
import BottomDrawerMoveNote from "@/components/drawers/bottom_drawer_move_note";
import BottomDrawerNoteDetails from "@/components/drawers/bottom_drawer_note_details";
import { convertToJson, parseEditorState } from "@/lib/text_editor";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ToastAndroid } from "react-native";
import { View } from "@/components/themed";

export default function NoteScreen() {
  const theme = useColorScheme();
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);
  const { noteId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [isShowMoreModalOpen, setIsShowMoreModalOpen] = React.useState(false);
  const bottomMoveNoteDrawerRef = React.useRef<BottomSheetModal>(null);
  const bottomNoteDetailsDrawerRef = React.useRef<BottomSheetModal>(null);
  const bottomDeleteNoteDrawerRef = React.useRef<BottomSheetModal>(null);
  const [isSearching, setIsSearching] = React.useState(false);

  const { data: noteData, isLoading: isLoadingNoteData } = useQuery({
    queryKey: ["note", Number(noteId)],
    queryFn: () => getNoteById(Number(noteId)),
    enabled: !!noteId,
  });

  const noteDate = noteData?.updated_at;

  const initialTitle = React.useMemo(() => {
    return noteData?.title;
  }, [noteData?.title]);

  const initialContent = React.useMemo(() => {
    return convertToJson(noteData?.content);
  }, [noteData?.content]);

  const stableKey = React.useMemo(() => {
    return noteId.toString();
  }, [noteId]);

  const [title, setTitle] = React.useState(initialTitle ?? "");
  const [content, setContent] = React.useState(initialContent ?? "");

  const titleRef = React.useRef(title);
  const contentRef = React.useRef(content);

  React.useEffect(() => {
    titleRef.current = title;
  }, [title]);

  React.useEffect(() => {
    contentRef.current = content;
  }, [content]);

  React.useEffect(() => {
    setTitle(noteData?.title || "");
    setContent(initialContent!);
  }, [noteData]);

  const handleUpdateNote = React.useCallback(async () => {
    const currentTitle = titleRef.current;
    const currentContent = contentRef.current;
    const noChanges =
      currentTitle === noteData?.title && currentContent === initialContent;

    if (noChanges && currentTitle.length > 0) {
      return;
    }

    try {
      await updateNote(Number(noteId), {
        title: currentTitle.length === 0 ? "Untitled note" : currentTitle,
        content: currentContent,
      });

      refetchNotes();
      refetchNotebooks();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, noteData?.title, initialContent]);

  // save note on back press (hardware button)
  React.useEffect(() => {
    const backAction = () => {
      if (isShowMoreModalOpen) {
        setIsShowMoreModalOpen(false);
        return true;
      }

      if (isSearching) {
        setIsSearching(false);
        return true;
      }

      handleUpdateNote().catch(() => {
        toast.error("Failed to save note. Please try again.");
      });

      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => subscription.remove();
  }, [isShowMoreModalOpen, isSearching, handleUpdateNote]);

  // save note on app state change
  React.useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        if (contentRef.current.length > 0) {
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
  }, [handleUpdateNote]);

  async function refetchNotes() {
    await queryClient.refetchQueries({ queryKey: ["notes"] });
    await queryClient.refetchQueries({ queryKey: ["note"] });
    await queryClient.refetchQueries({ queryKey: ["notes_calendar"] });
  }

  async function refetchNotebooks() {
    await queryClient.refetchQueries({ queryKey: ["notebook"] });
  }

  const handleShare = React.useCallback(async () => {
    try {
      await Share.share({
        title: titleRef.current,
        message: `${titleRef.current || "Untitled Note"}\n\n${parseEditorState(
          contentRef.current
        )}`,
      });
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }, []);

  async function handleDeleteNote() {
    try {
      await deleteNote(Number(noteId));
      refetchNotes();
      refetchNotebooks();
      if (router.canGoBack()) {
        router.back();
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }

  async function handleMoveNote(
    notebookId: number | undefined,
    isUncategorized?: boolean
  ) {
    try {
      handleUpdateNote();
      await addNotesToNotebook({
        noteIds: [Number(noteId)],
        notebookId,
        isUncategorized: isUncategorized,
      });
      toast.success("Moved successfully");
    } catch (error) {
      console.error("Error moving notes:", error);
      toast.error(
        "An error occurred while moving the notes. Please try again."
      );
    }
  }

  const handleOpenBottomMoveNoteDrawer = React.useCallback(() => {
    bottomMoveNoteDrawerRef.current?.present();
  }, []);

  const handleOpenBottomNoteDetailsDrawer = React.useCallback(() => {
    bottomNoteDetailsDrawerRef.current?.present();
  }, []);

  const handleOpenBottomNoteDeleteDrawer = React.useCallback(() => {
    bottomDeleteNoteDrawerRef.current?.present();
  }, []);

  // save note on back press button
  const handleBack = React.useCallback(async () => {
    setIsKeyboardVisible(false);
    Keyboard.dismiss();
    await handleUpdateNote();
    router.back();
  }, [handleUpdateNote]);

  const handleToastAndroid = React.useCallback((message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }, []);

  if (isLoadingNoteData || noteData === undefined) {
    return null;
  }

  return (
    <>
      <View
        style={styles.container}
        customBackgroundColor={colors[theme].background}
        key={stableKey}
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
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            handleShare={handleShare}
            handleOpenBottomMoveNoteDrawer={handleOpenBottomMoveNoteDrawer}
            handleOpenBottomNoteDetailsDrawer={
              handleOpenBottomNoteDetailsDrawer
            }
            handleOpenBottomNoteDeleteDrawer={handleOpenBottomNoteDeleteDrawer}
            setTitle={setTitle}
            setContent={setContent}
            title={initialTitle!}
            content={initialContent!}
            noteDate={noteDate!}
            handleToastAndroid={handleToastAndroid}
            theme={theme}
          />
        </KeyboardAwareScrollView>
      </View>

      <BottomDrawerConfirm
        ref={bottomDeleteNoteDrawerRef}
        title="Delete This Note?"
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
