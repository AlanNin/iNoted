import { StyleSheet } from "react-native";
import useColorScheme from "@/hooks/useColorScheme";
import { MotiView, Text, TouchableOpacity, View } from "./themed";
import colors from "@/constants/colors";
import { formatLongDate, formatMediumDate } from "@/lib/format_date";
import { router } from "expo-router";
import React, { useEffect } from "react";

const NoteCardGrid = React.memo(
  ({
    note,
    index,
    viewMode,
    isEditMode = false,
    setEditMode,
    selectedNotes,
    handleSelectNote,
  }: NoteCardProps) => {
    if (!note.id) {
      return <View style={gridStyles.innerContainer} />;
    }

    console.log(note, index);

    const theme = useColorScheme();

    // const delay = index ? index * 50 : 0;

    const handlePress = React.useCallback(() => {
      if (isEditMode) {
        handleSelectNote(note.id);
      } else {
        router.push(`./(notes)/${note.id}`);
      }
    }, [isEditMode, handleSelectNote, note.id]);

    const isSelected = React.useMemo(() => selectedNotes.includes(note.id), [
      selectedNotes,
      note.id,
    ]);

    const handleLongPress = React.useCallback(() => {
      if (!isSelected) {
        setEditMode(true);
        handleSelectNote(note.id);
      }
    }, [setEditMode, handleSelectNote, note.id]);

    // const animationProps = isEditMode
    //   ? {}
    //   : ({
    //       from: { opacity: 0, translateY: 10 },
    //       animate: { opacity: 1, translateY: 0 },
    //       transition: {
    //         type: "timing",
    //         duration: 250,
    //         delay,
    //       },
    //     } as any);

    const animationProps = {};

    if (viewMode === "grid") {
      return (
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          style={gridStyles.outerContainer}
        >
          <MotiView {...animationProps} style={gridStyles.innerContainer}>
            {isEditMode && (
              <View
                style={[
                  gridStyles.selectIndicator,
                  {
                    backgroundColor: isSelected
                      ? colors[theme].primary
                      : colors[theme].text_muted,
                  },
                ]}
              />
            )}

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
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          onPress={handlePress}
          style={listStyles.outerContainer}
        >
          {isEditMode && (
            <View
              style={[
                listStyles.selectIndicator,
                {
                  backgroundColor: isSelected
                    ? colors[theme].primary
                    : colors[theme].text_muted,
                },
              ]}
            />
          )}

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
  }
);

const gridStyles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    height: 216,
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
    height: 3,
    width: "100%",
  },
});

const listStyles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    height: 140,
    borderRadius: 8,
    overflow: "hidden",
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
    right: 0,
    height: "100%",
    width: 3,
  },
});

export default NoteCardGrid;
