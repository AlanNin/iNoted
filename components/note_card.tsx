import { StyleSheet } from "react-native";
import useColorScheme from "@/hooks/useColorScheme";
import { MotiView, Text, TouchableOpacity, View } from "./themed";
import colors from "@/constants/colors";
import { formatLongDate, formatMediumDate } from "@/lib/format_date";
import { router } from "expo-router";
import React from "react";
import { useNotesEditMode } from "@/hooks/useNotesEditMode";

const SelectedIndicator = ({
  noteId,
  viewMode,
  onPress,
}: {
  noteId: number;
  viewMode: "grid" | "list";
  onPress?: () => void;
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

    if (isNotesEditMode) {
      selectNote(noteId);
    } else {
      router.push(`./${noteId}`);
    }
  }, [isNotesEditMode, selectNote, noteId]);

  const handleLongPress = React.useCallback(() => {
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
  ({ note, index, viewMode, onPress, animated = true }: NoteCardProps) => {
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
            />
            <View style={gridStyles.contentContainer}>
              <Text style={gridStyles.content} numberOfLines={9}>
                {note.content}
              </Text>
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
                {formatMediumDate(note.created_at)}
              </Text>
            </View>
          </MotiView>
        </View>
      );
    } else {
      return (
        <TouchableOpacity style={listStyles.outerContainer}>
          <MotiView {...animationProps} style={listStyles.innerContainer}>
            <SelectedIndicator noteId={note.id} viewMode="list" />

            <Text style={listStyles.title} numberOfLines={1}>
              {note.title}
            </Text>
            <Text style={listStyles.content} numberOfLines={2}>
              {note.content}
            </Text>
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
              {formatLongDate(note.created_at)}
            </Text>
          </MotiView>
        </TouchableOpacity>
      );
    }
  },
  (prevProps, nextProps) => {
    return (
      prevProps.note.id === nextProps.note.id &&
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
