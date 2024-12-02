import { StyleSheet, useColorScheme } from "react-native";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "@/components/themed";
import {
  ArrowLeft,
  EllipsisVertical,
  Redo2,
  Save,
  Undo2,
} from "lucide-react-native";
import colors from "@/constants/colors";
import { router } from "expo-router";
import { formatLongDate } from "@/lib/format_date";
import { createNote } from "@/queries/notes";
import { useQueryClient } from "@tanstack/react-query";

export default function NewNoteScreen() {
  const queryClient = useQueryClient();

  const colorScheme = useColorScheme();

  const [inputs, setInputs] = React.useState<NewNote>({
    title: "",
    content: "",
  });

  const [lastEdited, setLastEdited] = React.useState(new Date());

  const undoStack = React.useRef<NewNote[]>([]);
  const redoStack = React.useRef<NewNote[]>([]);
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);

  function handleInputChange(name: keyof NewNote, value: string) {
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

  async function handleCreateNote() {
    if (inputs.content.length === 0) {
      return;
    }

    try {
      await createNote(inputs);
      await queryClient.refetchQueries({ queryKey: ["notes"] });
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
            <ArrowLeft
              size={24}
              color={
                colorScheme === "light" ? colors.light.text : colors.dark.text
              }
              strokeWidth={1.5}
            />
          </TouchableOpacity>
          <View style={styles.headerSecton}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleUndo}
              disabled={undoStack.current.length === 0}
            >
              <Undo2
                size={24}
                color={
                  undoStack.current.length > 0
                    ? colorScheme === "light"
                      ? colors.light.text
                      : colors.dark.text
                    : colorScheme === "light"
                    ? colors.light.text_muted2
                    : colors.dark.text_muted2
                }
                strokeWidth={1.5}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleRedo}
              disabled={redoStack.current.length === 0}
            >
              <Redo2
                size={24}
                color={
                  redoStack.current.length > 0
                    ? colorScheme === "light"
                      ? colors.light.text
                      : colors.dark.text
                    : colorScheme === "light"
                    ? colors.light.text_muted2
                    : colors.dark.text_muted2
                }
                strokeWidth={1.5}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateNote}
              disabled={inputs.content.length === 0}
            >
              <Save
                size={24}
                color={
                  colorScheme === "light"
                    ? inputs.content.length > 0
                      ? colors.light.text
                      : colors.light.text_muted2
                    : inputs.content.length > 0
                    ? colors.dark.text
                    : colors.dark.text_muted2
                }
                strokeWidth={1.5}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                console.log("TODO: Dots -> More");
              }}
            >
              <EllipsisVertical
                size={24}
                color={
                  colorScheme === "light" ? colors.light.text : colors.dark.text
                }
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.content}>
          <Text
            style={[
              styles.lastEditedText,
              {
                color:
                  colorScheme === "light"
                    ? colors.light.text_muted
                    : colors.dark.text_muted,
              },
            ]}
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
          <TextInput
            value={inputs.content}
            onChangeText={(e) => handleInputChange("content", e)}
            multiline={true}
            style={[styles.noteContent]}
            placeholder="Capture your thoughts..."
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
