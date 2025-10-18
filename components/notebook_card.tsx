import { Dimensions, StyleSheet } from "react-native";
import { Text, TouchableOpacity, View } from "./themed";
import React from "react";
import { useNotebooksEditMode } from "@/hooks/useNotebooksEditMode";
import useColorScheme from "@/hooks/useColorScheme";
import colors from "@/constants/colors";
import { useNotebooksSelectedToMoveMode } from "@/hooks/useNotebookSelectedToMove";
import { Image } from "expo-image";
import { useNotebooksSelectedToFilterMode } from "@/hooks/useNotebookSelectedToFilter";
import { NoteBookCardProps } from "@/types/notebook_card";
import * as Haptics from "expo-haptics";

const SelectedIndicator = ({
  notebookId,
  onPress,
  disabled,
  name,
  numberOfLinesName,
  isLoading,
}: {
  notebookId: number;
  onPress?: (notebookId: number) => void;
  disabled?: boolean;
  name: string;
  numberOfLinesName: number;
  isLoading: boolean;
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
      onPress?.(notebookId!);
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
      disabled={disabled}
    >
      <View
        style={[styles.nameContainer, isNotebooksEditMode && { bottom: 22 }]}
      >
        <Text
          style={[
            styles.name,
            isNotebooksEditMode && {
              borderWidth: 2,
              borderColor: isSelected
                ? colors[theme].primary
                : colors.dark.tint,
            },
          ]}
          customTextColor="white"
          numberOfLines={numberOfLinesName}
        >
          {isLoading ? "Loading..." : name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const SelectedIndicatorToMove = ({
  notebookId,
  name,
  numberOfLinesName,
  isLoading,
  isToMove,
  isToFilter,
  defaultSelected,
  disabled,
}: {
  notebookId: number;
  name: string;
  numberOfLinesName: number;
  isLoading: boolean;
  isToMove: boolean;
  isToFilter: boolean;
  defaultSelected: boolean;
  disabled: boolean;
}) => {
  const {
    selectedNotebook: selectedNotebookMove,
    toggleNotebooksSelectedToMoveMode: toggleNotebooksSelectedToMoveMode,
    selectNotebook: selectNotebookMove,
  } = useNotebooksSelectedToMoveMode();

  const {
    selectedNotebook: selectedNotebookFilter,
    toggleNotebooksSelectedToFilterMode: toggleNotebooksSelectedToFilterMode,
    selectNotebook: selectNotebookFilter,
  } = useNotebooksSelectedToFilterMode();

  const theme = useColorScheme();

  const isSelected =
    defaultSelected ||
    selectedNotebookMove === notebookId ||
    selectedNotebookFilter === notebookId;

  const handlePress = () => {
    if (isToMove) {
      selectNotebookMove(notebookId);
    } else if (isToFilter) {
      selectNotebookFilter(notebookId);
    }
  };

  const handleLongPress = () => {
    if (!isSelected) {
      if (isToMove) {
        toggleNotebooksSelectedToMoveMode();
        selectNotebookMove(notebookId);
      } else if (isToFilter) {
        toggleNotebooksSelectedToFilterMode();
        selectNotebookFilter(notebookId);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={styles.selectIndicatorContainer}
      disabled={disabled}
    >
      <View style={[styles.nameContainer, { bottom: 22 }]}>
        <Text
          style={[
            styles.name,
            {
              borderWidth: 2,
              borderColor: isSelected
                ? colors[theme].primary
                : colors.dark.tint,
            },
          ]}
          customTextColor="white"
          numberOfLines={numberOfLinesName}
        >
          {isLoading ? "Loading..." : name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const NotebookCard = React.memo(
  ({
    notebook,
    isAdding = false,
    numberOfLinesName = 1,
    onPress,
    isLoading = false,
    isToMove = false,
    isToFilter = false,
    disabled = false,
    mini = false,
    showName = true,
    defaultSelected = false,
  }: NoteBookCardProps) => {
    const isBackgroundAColor =
      typeof notebook.background === "string" &&
      notebook.background.includes("#");

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

    const { width } = Dimensions.get("screen");

    return (
      <View
        style={[
          styles.container,
          isAdding && { minWidth: !mini && width > 400 ? 120 : 104 },
          { height: !mini && width > 400 ? 180 : 156 },
          { opacity: defaultSelected ? 0.5 : 1 },
        ]}
        customBackgroundColor="transparent"
      >
        {showName && (
          <>
            {isToMove || isToFilter ? (
              <SelectedIndicatorToMove
                notebookId={notebook.id!}
                name={notebook.name}
                numberOfLinesName={numberOfLinesName}
                isLoading={isLoading}
                isToMove={isToMove}
                isToFilter={isToFilter}
                defaultSelected={defaultSelected}
                disabled={disabled}
              />
            ) : (
              <SelectedIndicator
                notebookId={notebook.id!}
                onPress={onPress ? onPress : undefined}
                disabled={disabled}
                name={notebook.name}
                numberOfLinesName={numberOfLinesName}
                isLoading={isLoading}
              />
            )}
          </>
        )}

        <View
          style={[
            styles.book,
            {
              backgroundColor: colorSource,
              shadowColor: colorSource,
            },
          ]}
        >
          {!isBackgroundAColor && !isLoading && (
            <View style={styles.bookImageContainer}>
              <Image source={imageSource} style={styles.bookImage} />
            </View>
          )}
          <View style={styles.bookBorder} />
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.notebook.id === nextProps.notebook.id &&
      prevProps.notebook.name === nextProps.notebook.name &&
      prevProps.notebook.background === nextProps.notebook.background &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.defaultSelected === nextProps.defaultSelected &&
      prevProps.disabled === nextProps.disabled
    );
  }
);

const styles = StyleSheet.create({
  container: {
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
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
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
});

export default NotebookCard;
