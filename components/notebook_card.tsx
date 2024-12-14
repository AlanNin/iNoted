import { Image, StyleSheet } from "react-native";
import { MotiView, Text, TouchableOpacity, View } from "./themed";
import React from "react";
import { useNotebooksEditMode } from "@/hooks/useNotebooksEditMode";
import useColorScheme from "@/hooks/useColorScheme";
import colors from "@/constants/colors";

// TODO: try to find a way to indicate long press
const SelectedIndicator = ({
  notebookId,
  onPress,
}: {
  notebookId: number;
  onPress: (notebookId: number) => void;
}) => {
  const {
    isNotebooksEditMode,
    selectNotebook,
    toggleNotebooksEditMode,
    selectedNotebooks,
  } = useNotebooksEditMode();

  const theme = useColorScheme();

  const isSelected = selectedNotebooks.includes(notebookId);

  const handlePress = React.useCallback(() => {
    if (isNotebooksEditMode) {
      selectNotebook(notebookId);
    } else {
      onPress(notebookId!);
    }
  }, [isNotebooksEditMode, selectNotebook, notebookId]);

  const handleLongPress = React.useCallback(() => {
    const isSelected = selectedNotebooks.includes(notebookId);

    if (!isSelected) {
      toggleNotebooksEditMode();
      selectNotebook(notebookId);
    }
  }, [selectedNotebooks, toggleNotebooksEditMode, selectNotebook, notebookId]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={styles.selectIndicatorContainer}
    >
      {isNotebooksEditMode && (
        <View
          style={[
            styles.selectIndicator,
            {
              borderColor: isSelected
                ? colors[theme].primary
                : colors.dark.tint,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const NotebookCard = React.memo(
  ({
    notebook,
    index,
    isAdding = false,
    numberOfLinesName = 1,
    onPress,
    isLoading = false,
  }: NoteBookCardProps) => {
    const theme = useColorScheme();

    const isBackgroundAColor =
      typeof notebook.background === "string" &&
      notebook.background.includes("#");

    const delay = index ? index * 50 : 0;
    const animationProps = {
      from: { opacity: 0, translateY: 10 },
      animate: { opacity: 1, translateY: 0 },
      transition: {
        type: "timing",
        duration: 250,
        delay,
      },
    } as any;

    const colorSource = isLoading
      ? colors.dark.grayscale
      : isBackgroundAColor
      ? notebook.background
      : "transparent";

    const imageSource =
      typeof notebook.background === "string" &&
      notebook.background.startsWith("file:")
        ? { uri: notebook.background }
        : (notebook.background as any);

    return (
      <MotiView
        {...animationProps}
        style={[styles.container, isAdding && { width: 120 }]}
      >
        <SelectedIndicator notebookId={notebook.id!} onPress={onPress!} />

        <View
          style={[
            styles.book,
            {
              backgroundColor: colorSource,
              shadowColor: colorSource,
            },
          ]}
        >
          <View style={styles.nameContainer}>
            <Text
              style={styles.name}
              customTextColor="white"
              numberOfLines={numberOfLinesName}
            >
              {isLoading ? "Loading..." : notebook.name}
            </Text>
          </View>

          {!isBackgroundAColor && !isLoading && (
            <View style={styles.bookImageContainer}>
              <Image source={imageSource} style={styles.bookImage} />
            </View>
          )}
          <View style={styles.bookBorder} />
        </View>
      </MotiView>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.notebook.id === nextProps.notebook.id &&
      prevProps.notebook.name === nextProps.notebook.name &&
      prevProps.notebook.background === nextProps.notebook.background &&
      prevProps.isLoading === nextProps.isLoading
    );
  }
);

const styles = StyleSheet.create({
  container: {
    // height: 216,
    height: 180,
    flexGrow: 1,
    flexDirection: "column",
    gap: 8,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  book: {
    flex: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    elevation: 8,
    display: "flex",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bookBorder: {
    position: "absolute",
    inset: 0,
    borderWidth: 3,
    borderLeftWidth: 6,
    borderColor: "rgba(0, 0, 0, 0.15)",
    backgroundColor: "transparent",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  nameContainer: {
    position: "absolute",
    zIndex: 10,
    bottom: 24,
    right: -2,
    backgroundColor: "transparent",
    overflow: "hidden",
    width: "95%",
  },
  name: {
    fontWeight: "bold",
    letterSpacing: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 4,
    paddingHorizontal: 8,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    boxShadow: "0 0 150px rgba(0, 0, 0, 0.4)",
  },
  bookImageContainer: {
    flex: 1,
    overflow: "hidden",
    width: "100%",
    height: "100%",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  bookImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  selectIndicatorContainer: {
    position: "absolute",
    inset: 0,
    zIndex: 10,
  },
  selectIndicator: {
    position: "absolute",
    backgroundColor: "transparent",
    bottom: 24,
    right: -2,
    width: "95%",
    height: 30,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    borderWidth: 2,
  },
});

export default NotebookCard;
