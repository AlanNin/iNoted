import React from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { Text, TouchableOpacity, View } from "./themed";
import { BackHandler, Dimensions, StyleSheet } from "react-native";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import NotebookCard from "./notebook_card";
import { useQuery } from "@tanstack/react-query";
import { getAllNotebooks } from "@/queries/notebooks";
import { FlashList } from "@shopify/flash-list";
import { useNotebooksSelectedToMoveMode } from "@/hooks/useNotebookSelectedToMove";
import Icon from "./icon";
import Loader from "./loading";
import { useNotebooksNotes } from "@/hooks/useNotebookNotes";

const BottomDrawerSelectNotebook = React.forwardRef<
  BottomSheetModal,
  Omit<BottomDrawerSelectNotebookProps, "ref">
>(({ title, description }, ref) => {
  const theme = useColorScheme();
  const {
    selectedNotebookToShow,
    setSelectedNotebookToShow,
    clearSelectedNotebookToShow,
  } = useNotebooksNotes();

  const { data: notebooks, isLoading: isLoadingNotebooks } = useQuery({
    queryKey: ["notebooks"],
    queryFn: () => getAllNotebooks(),
  });

  const {
    selectedNotebook,
    clearSelectedNotebook,
  } = useNotebooksSelectedToMoveMode();

  const closeDrawer = () => {
    (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
    clearSelectedNotebook();
  };

  const isButtonDisabled = !selectedNotebookToShow && selectedNotebook === null;

  const handleSelectNotebook = () => {
    if (isButtonDisabled) {
      return;
    }

    if (selectedNotebookToShow && !selectedNotebook) {
      clearSelectedNotebookToShow();
      closeDrawer();
      return;
    }

    const dataNotebook = notebooks?.find(
      (notebook) => notebook.id === selectedNotebook!
    );

    setSelectedNotebookToShow(dataNotebook!);
    closeDrawer();
  };

  const [sheetStatus, setSheetStatus] = React.useState<"open" | "close">(
    "close"
  );

  React.useEffect(() => {
    const backAction = () => {
      if (sheetStatus === "open") {
        closeDrawer();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [sheetStatus, setSheetStatus]);

  const { width } = Dimensions.get("screen");

  const renderNotebooks = ({
    item,
    index,
  }: {
    item: NotebookProps;
    index: number;
  }) => (
    <NotebookCard
      key={`${item.id}-${item.name}-${item.background}`}
      notebook={item}
      index={index}
      onPress={() => {}}
      isToMove={true}
    />
  );

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        onChange={(status) => {
          if (status === 0) {
            setSheetStatus("open");
          } else {
            setSheetStatus("close");
          }
        }}
        enableContentPanningGesture={false}
        ref={ref}
        backdropComponent={() => (
          <TouchableOpacity
            style={[styles.backdrop]}
            activeOpacity={1}
            onPress={() => closeDrawer()}
          />
        )}
        backgroundStyle={{
          backgroundColor: colors[theme].background,
        }}
        handleIndicatorStyle={{
          backgroundColor: colors[theme].grayscale,
        }}
      >
        <BottomSheetView
          style={[
            styles.container,
            notebooks && notebooks.length > 0
              ? { minHeight: 580, maxHeight: 580 }
              : { minHeight: 0 },
          ]}
        >
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={closeDrawer}>
              <Text customTextColor={colors[theme].primary}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              disabled={isButtonDisabled}
              onPress={handleSelectNotebook}
            >
              <Text
                customTextColor={
                  !isButtonDisabled
                    ? colors[theme].primary
                    : colors[theme].primary_foggy
                }
              >
                {selectedNotebookToShow && !selectedNotebook
                  ? "Show All"
                  : "Confirm"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {description && (
              <Text style={styles.description} disabled>
                {description}
              </Text>
            )}
          </View>
          {isLoadingNotebooks ? (
            <View style={styles.loadingContainer}>
              <Loader />
              <Text style={styles.loadingText}>Loading notebooks...</Text>
            </View>
          ) : (
            <>
              {notebooks && notebooks.length > 0 ? (
                <View style={styles.notebooksContainer}>
                  <FlashList
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id?.toString() || `${item.id}`}
                    data={notebooks}
                    renderItem={renderNotebooks}
                    numColumns={3}
                    estimatedItemSize={width > 400 ? 180 : 156}
                  />
                </View>
              ) : (
                <View style={styles.noNotesContainer}>
                  <Icon name="Microscope" size={24} strokeWidth={1} muted />
                  <Text style={styles.noNotesText} disabled>
                    No notebooks found
                  </Text>
                </View>
              )}
            </>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    gap: 20,
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerButton: {
    padding: 4,
  },
  header: {
    flexDirection: "column",
    gap: 4,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    letterSpacing: 0.5,
  },
  notebooksContainer: {
    marginHorizontal: 8,
    flex: 1,
  },
  noNotesContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
    marginVertical: 20,
    marginBottom: 40,
  },
  noNotesText: {
    fontSize: 16,
    alignSelf: "center",
  },
  loadingContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
    marginVertical: 20,
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    alignSelf: "center",
  },
});

export default BottomDrawerSelectNotebook;
