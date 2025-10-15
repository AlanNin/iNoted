import { StyleSheet } from "react-native";
import useColorScheme from "@/hooks/useColorScheme";
import { Text, TouchableOpacity, View } from "./themed";
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
import Icon from "./icon";

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
  const { isNotesEditMode, selectNote, toggleNotesEditMode, selectedNotes } =
    useNotesEditMode();

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
    viewMode,
    onPress,
    selectDisabled = false,
    dateType = "date",
    showNotebookIndicator,
  }: NoteCardProps) => {
    if (!note.id) {
      return <View style={gridStyles.innerContainer} />;
    }

    const belongsToNotebook =
      note.notebook_id !== null && note.notebook_name !== null;

    const numberOfLines =
      viewMode === "grid"
        ? belongsToNotebook && showNotebookIndicator
          ? 7 //  Belongs to a notebook
          : 9 // Does not belong to a notebook
        : belongsToNotebook && showNotebookIndicator
        ? 3 // Belongs to a notebook
        : 3; // Does not belong to a notebook

    const theme = useColorScheme();

    const preview = React.useMemo(
      () => parseEditorState(note.content),
      [note.content]
    );

    if (viewMode === "grid") {
      return (
        <View style={gridStyles.outerContainer}>
          <View style={gridStyles.innerContainer}>
            <SelectedIndicator
              noteId={note.id}
              viewMode="grid"
              onPress={onPress!}
              selectDisabled={selectDisabled}
            />
            <View style={gridStyles.contentContainer}>
              <>
                {preview.length > 0 ? (
                  <Text
                    style={gridStyles.content}
                    numberOfLines={numberOfLines}
                  >
                    {preview}
                  </Text>
                ) : (
                  <Text
                    style={gridStyles.noContent}
                    numberOfLines={numberOfLines}
                    disabled
                  >
                    No content...
                  </Text>
                )}
                {belongsToNotebook && showNotebookIndicator && (
                  <View style={gridStyles.notebookIndicator}>
                    <Icon
                      name="Notebook"
                      size={12}
                      customColor={colors[theme].notebook_indicator}
                    />
                    <Text
                      style={gridStyles.notebookIndicatorText}
                      customTextColor={colors[theme].notebook_indicator}
                      numberOfLines={1}
                    >
                      {note.notebook_name}
                    </Text>
                  </View>
                )}
              </>
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
          </View>
        </View>
      );
    } else {
      return (
        <TouchableOpacity style={listStyles.outerContainer}>
          <View style={listStyles.innerContainer}>
            <SelectedIndicator
              noteId={note.id}
              viewMode="list"
              selectDisabled={selectDisabled}
            />

            <Text style={listStyles.title} numberOfLines={1}>
              {note.title}
            </Text>

            {preview.length > 0 ? (
              <Text style={listStyles.content} numberOfLines={numberOfLines}>
                {preview}
              </Text>
            ) : (
              <Text
                style={listStyles.noContent}
                numberOfLines={numberOfLines}
                disabled
              >
                No content...
              </Text>
            )}
            <View style={listStyles.bottomDetailsContainer}>
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
              {belongsToNotebook && showNotebookIndicator && (
                <View style={listStyles.notebookIndicator}>
                  <Icon
                    name="Notebook"
                    size={12}
                    customColor={colors[theme].notebook_indicator}
                  />
                  <Text
                    style={listStyles.notebookIndicatorText}
                    customTextColor={colors[theme].notebook_indicator}
                    numberOfLines={1}
                  >
                    {note.notebook_name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  },
  (prevProps, nextProps) => {
    return (
      prevProps.note.id === nextProps.note.id &&
      prevProps.note.title === nextProps.note.title &&
      prevProps.note.content === nextProps.note.content &&
      prevProps.note.notebook_id === nextProps.note.notebook_id &&
      prevProps.note.notebook_name === nextProps.note.notebook_name &&
      prevProps.showNotebookIndicator === nextProps.showNotebookIndicator &&
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
    position: "relative",
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
  notebookIndicator: {
    position: "absolute",
    backgroundColor: "transparent",
    bottom: 12,
    right: 12,
    left: 12,
    zIndex: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  notebookIndicatorText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
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
  bottomDetailsContainer: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  date: {
    fontSize: 12,
  },
  notebookIndicator: {
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  notebookIndicatorText: {
    fontSize: 12,
    lineHeight: 16,
    maxWidth: "80%",
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
