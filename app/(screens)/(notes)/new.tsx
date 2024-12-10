import { StyleSheet } from "react-native";
import useColorScheme from "@/hooks/useColorScheme";
import React from "react";
import {
  MarkdownTextInput,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "@/components/themed";
import colors from "@/constants/colors";
import { router } from "expo-router";
import { formatLongDate } from "@/lib/format_date";
import { createNote } from "@/queries/notes";
import { useQueryClient } from "@tanstack/react-query";
import Icon from "@/components/icon";
import { parseExpensiMark } from "@expensify/react-native-live-markdown";

export default function NewNoteScreen() {
  const theme = useColorScheme();
  const [lastEdited, setLastEdited] = React.useState(new Date());
  const undoStack = React.useRef<NewNoteProps[]>([]);
  const redoStack = React.useRef<NewNoteProps[]>([]);
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const [inputs, setInputs] = React.useState<NewNoteProps>({
    title: "",
    content: "",
  });

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
    setLastEdited(new Date());
  }

  function handleUndo() {
    if (undoStack.current.length > 0) {
      const previousState = undoStack.current.pop()!;
      redoStack.current.push({ ...inputs });
      setInputs(previousState);
      setLastEdited(new Date());
    }
  }

  function handleRedo() {
    if (redoStack.current.length > 0) {
      const nextState = redoStack.current.pop()!;
      undoStack.current.push({ ...inputs });
      setInputs(nextState);
      setLastEdited(new Date());
    }
  }

  async function refetchNotes() {
    await queryClient.refetchQueries({ queryKey: ["notes"] });
  }

  async function handleCreateNote() {
    if (inputs.content.length === 0) {
      return;
    }

    try {
      await createNote({
        ...inputs,
        title: inputs.title.length === 0 ? "Untitled note" : inputs.title,
      });
      await refetchNotes();
      router.back();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
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
              onPress={handleCreateNote}
              disabled={inputs.content.length === 0}
            >
              <Icon name="Save" muted={inputs.content.length === 0} />
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.button}
              onPress={() => {
                console.log("TODO: Dots -> More");
              }}
            >
              <Icon name="EllipsisVertical" />
            </TouchableOpacity> */}
          </View>
        </View>
        <View style={styles.content}>
          <Text
            style={styles.lastEditedText}
            customTextColor={colors[theme].grayscale}
          >
            Last edited at {formatLongDate(lastEdited)}
          </Text>
          <TextInput
            value={inputs.title}
            onChangeText={(e) => handleInputChange("title", e)}
            style={[styles.noteTitle]}
            placeholder="Untitled note"
            multiline={true}
          />
          <MarkdownTextInput
            value={inputs.content}
            onChangeText={(e) => handleInputChange("content", e)}
            multiline={true}
            style={[styles.noteContent]}
            placeholder="Capture your thoughts..."
            autoFocus={true}
            parser={parseExpensiMark}
          />
        </View>
      </View>
    </View>
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
});
