import { StyleSheet } from "react-native";
import useColorScheme from "@/hooks/useColorScheme";
import { MotiView, Text, TouchableOpacity, View } from "./themed";
import colors from "@/constants/colors";
import {
  formatLongDate,
  formatMediumDate,
  formatTime,
} from "@/lib/format_date";
import { router } from "expo-router";
import React from "react";
import { useNotesEditMode } from "@/hooks/useNotesEditMode";
import { parseEditorState } from "@/lib/text_editor";

const SelectedIndicator = ({
  noteId,
  viewMode,
  onPress,
  selectDisabled = false,
}: {
  noteId: number;
  viewMode: "grid" | "list";
  onPress?: () => void;
  selectDisabled?: boolean;
}) => {
  const {
    isNotesEditMode,
    selectNote,
    toggleNotesEditMode,
    selectedNotes,
  } = useNotesEditMode();

  const theme = useColorScheme();

  const isSelected = selectedNotes.includes(noteId);

  const handlePress = React.useCallback(() => {
    onPress?.();

    if (isNotesEditMode && !selectDisabled) {
      selectNote(noteId);
    } else {
      router.push(`${noteId}`);
    }
  }, [isNotesEditMode, selectNote, noteId]);

  const handleLongPress = React.useCallback(() => {
    if (selectDisabled) {
      return;
    }

    const isSelected = selectedNotes.includes(noteId);

    if (!isSelected) {
      toggleNotesEditMode();
      selectNote(noteId);
    }
  }, [selectedNotes, toggleNotesEditMode, selectNote, noteId]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
      }}
    >
      <View
        style={[
          {
            backgroundColor: colors[theme].foggiest,
          },
          neutralStyles.nonSelectIndicator,
          isNotesEditMode && viewMode === "grid" && { borderTopWidth: 3 },
          isNotesEditMode && viewMode === "list" && { borderRightWidth: 3 },
          isNotesEditMode && isSelected
            ? { borderColor: colors[theme].primary }
            : { borderColor: colors[theme].text_muted },
        ]}
      />
    </TouchableOpacity>
  );
};

const NoteCard = React.memo(
  ({
    note,
    index,
    viewMode,
    onPress,
    animated = true,
    selectDisabled = false,
    dateType = "date",
  }: NoteCardProps) => {
    if (!note.id) {
      return <View style={gridStyles.innerContainer} />;
    }

    const theme = useColorScheme();

    const delay = index ? index * 50 : 0;

    const animationProps = animated
      ? ({
          from: { opacity: 0, translateY: 10 },
          animate: { opacity: 1, translateY: 0 },
          transition: {
            type: "timing",
            duration: 250,
            delay,
          },
        } as any)
      : {};

    if (viewMode === "grid") {
      return (
        <View style={gridStyles.outerContainer}>
          <MotiView {...animationProps} style={gridStyles.innerContainer}>
            <SelectedIndicator
              noteId={note.id}
              viewMode="grid"
              onPress={onPress!}
              selectDisabled={selectDisabled}
            />
            <View style={gridStyles.contentContainer}>
              {parseEditorState(note.content).length > 0 ? (
                <Text style={gridStyles.content} numberOfLines={9}>
                  {parseEditorState(note.content)}
                </Text>
              ) : (
                <Text style={gridStyles.noContent} numberOfLines={9} disabled>
                  No content...
                </Text>
              )}
            </View>
            <View style={gridStyles.detailsContainer}>
              <Text style={gridStyles.title} numberOfLines={1}>
                {note.title}
              </Text>
              <Text
                style={[
                  gridStyles.date,
                  {
                    color:
                      theme === "light"
                        ? colors.light.grayscale
                        : colors.dark.grayscale,
                  },
                ]}
                numberOfLines={1}
              >
                {dateType === "date"
                  ? formatMediumDate(note.created_at)
                  : formatTime(note.created_at)}
              </Text>
            </View>
          </MotiView>
        </View>
      );
    } else {
      return (
        <TouchableOpacity style={listStyles.outerContainer}>
          <MotiView {...animationProps} style={listStyles.innerContainer}>
            <SelectedIndicator
              noteId={note.id}
              viewMode="list"
              selectDisabled={selectDisabled}
            />

            <Text style={listStyles.title} numberOfLines={1}>
              {note.title}
            </Text>

            {parseEditorState(note.content).length > 0 ? (
              <Text style={listStyles.content} numberOfLines={3}>
                {parseEditorState(note.content)}
              </Text>
            ) : (
              <Text style={listStyles.noContent} numberOfLines={3} disabled>
                No content...
              </Text>
            )}
            <Text
              style={[
                listStyles.date,
                {
                  color:
                    theme === "light"
                      ? colors.light.grayscale
                      : colors.dark.grayscale,
                },
              ]}
              numberOfLines={1}
            >
              {dateType === "date"
                ? formatLongDate(note.created_at)
                : formatTime(note.created_at)}
            </Text>
          </MotiView>
        </TouchableOpacity>
      );
    }
  },
  (prevProps, nextProps) => {
    return (
      prevProps.note.id === nextProps.note.id &&
      prevProps.note.title === nextProps.note.title &&
      prevProps.note.content === nextProps.note.content &&
      prevProps.viewMode === nextProps.viewMode
    );
  }
);

const gridStyles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    height: 216,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  innerContainer: {
    flex: 1,
    gap: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  contentContainer: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  content: {
    fontSize: 12,
    flex: 1,
  },
  noContent: {
    fontSize: 12,
    flex: 1,
    fontStyle: "italic",
  },
  detailsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
  },
  date: {
    fontSize: 12,
    textAlign: "center",
  },
  selectIndicator: {
    position: "absolute",
    inset: 0,
    zIndex: 10,
    borderTopWidth: 3,
    borderRadius: 8,
  },
});

const listStyles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    height: 140,
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 8,
    marginBottom: 16,
  },
  innerContainer: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflow: "hidden",
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
  },
  content: {
    fontSize: 12,
  },
  noContent: {
    fontSize: 12,
    flex: 1,
    fontStyle: "italic",
  },
  date: {
    marginTop: "auto",
    fontSize: 12,
  },
  selectIndicator: {
    position: "absolute",
    inset: 0,
    zIndex: 10,
    borderRightWidth: 3,
  },
});

const neutralStyles = StyleSheet.create({
  nonSelectIndicator: {
    position: "absolute",
    inset: 0,
    borderRadius: 8,
    maxHeight: 166,
  },
});

export default NoteCard;
