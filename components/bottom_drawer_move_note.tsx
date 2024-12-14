import React from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Text, TouchableOpacity, View } from "./themed";
import { StyleSheet } from "react-native";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import NotebookCard from "./notebook_card";
import { useQuery } from "@tanstack/react-query";
import { getAllNotebooks } from "@/queries/notebooks";
import { FlashList } from "@shopify/flash-list";

const BottomDrawerMoveNote = React.forwardRef<
  BottomSheetModal,
  Omit<BottomDrawerMoveNoteProps, "ref">
>(({ noteId, title, description, onSubmit }, ref) => {
  const theme = useColorScheme();

  const { data: notebooks, isLoading: isLoadingNotebooks } = useQuery({
    queryKey: ["notebooks"],
    queryFn: () => getAllNotebooks(),
  });

  const closeDrawer = () => {
    (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
  };

  // TODO: manage notebook to move select state, do the actual functionality
  const handleSubmit = () => {
    onSubmit();
    closeDrawer();
  };

  const snapPoints = React.useMemo(() => ["60%"], []);

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
    />
  );

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enableContentPanningGesture={false}
        // onAnimate={() =>
        //   (ref as React.RefObject<BottomSheetModal>).current?.expand()
        // }
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
        <BottomSheetView style={styles.container}>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={closeDrawer}>
              <Text customTextColor={colors[theme].primary}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Text customTextColor={colors[theme].primary}>Save</Text>
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

          <View style={styles.notebooksContainer}>
            {/* Wrap the list inside ScrollView */}
            <FlashList
              keyExtractor={(item) => item.id?.toString() || `${item.id}`}
              data={notebooks}
              renderItem={renderNotebooks}
              numColumns={3}
              estimatedItemSize={180}
            />
          </View>
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
});

export default BottomDrawerMoveNote;
