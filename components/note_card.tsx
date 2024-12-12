import { StyleSheet } from "react-native";
import useColorScheme from "@/hooks/useColorScheme";
import { MotiView, Text, TouchableOpacity, View } from "./themed";
import colors from "@/constants/colors";
import { formatLongDate, formatMediumDate } from "@/lib/format_date";
import { router } from "expo-router";
import React from "react";
import { useEditMode } from "@/hooks/useEditMode";

const SelectedIndicator = ({
  noteId,
  style,
  viewMode,
}: {
  noteId: number;
  style: any;
  viewMode: "grid" | "list";
}) => {
  const {
    isEditMode,
    selectNote,
    toggleEditMode,
    selectedNotes,
  } = useEditMode();

  const theme = useColorScheme();

  const isSelected = selectedNotes.includes(noteId);

  const handlePress = React.useCallback(() => {
    if (isEditMode) {
      selectNote(noteId);
    } else {
      router.push(`./(notes)/${noteId}`);
    }
  }, [isEditMode, selectNote, noteId]);

  const handleLongPress = React.useCallback(() => {
    const isSelected = selectedNotes.includes(noteId);

    if (!isSelected) {
      toggleEditMode();
      selectNote(noteId);
    }
  }, [selectedNotes, toggleEditMode, selectNote, noteId]);

  if (!isEditMode) return null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={[
        style,
        {
          [viewMode === "grid"
            ? "borderTopColor"
            : "borderRightColor"]: isSelected
            ? colors[theme].primary
            : colors[theme].text_muted,
        },
      ]}
    />
  );
};

const NoteCard = React.memo(
  ({ note, viewMode }: NoteCardProps) => {
    if (!note.id) {
      return <View style={gridStyles.innerContainer} />;
    }

    const theme = useColorScheme();

    const animationProps = {};

    if (viewMode === "grid") {
      return (
        <View style={gridStyles.outerContainer}>
          <SelectedIndicator
            noteId={note.id}
            style={gridStyles.selectIndicator}
            viewMode="grid"
          />

          <MotiView {...animationProps} style={gridStyles.innerContainer}>
            <View
              style={[
                gridStyles.contentContainer,
                {
                  backgroundColor:
                    theme === "light"
                      ? colors.light.foggiest
                      : colors.dark.foggiest,
                },
              ]}
            >
              <Text style={gridStyles.content} numberOfLines={8}>
                {note.content}
              </Text>
            </View>
            <View style={gridStyles.detailsContainer}>
              <Text style={gridStyles.title} numberOfLines={2}>
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
          <SelectedIndicator
            noteId={note.id}
            style={listStyles.selectIndicator}
            viewMode="list"
          />

          <MotiView
            {...animationProps}
            style={[
              listStyles.innerContainer,
              {
                backgroundColor:
                  theme === "light"
                    ? colors.light.foggiest
                    : colors.dark.foggiest,
              },
            ]}
          >
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
    marginHorizontal: 16,
    marginBottom: 16,
  },
  innerContainer: {
    flex: 1,
    gap: 8,
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
    marginHorizontal: 16,
    marginBottom: 16,
  },
  innerContainer: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 12,
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
    borderRadius: 4,
  },
});

export default NoteCard;
