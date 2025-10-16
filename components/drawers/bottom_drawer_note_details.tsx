import React from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { Text, TouchableOpacity, View } from "../themed";
import { BackHandler, StyleSheet } from "react-native";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import { formatLongDate } from "@/lib/format_date";
import { getNotebookById } from "@/queries/notebooks";
import { useQuery } from "@tanstack/react-query";
import { BottomDrawerNoteDetailsProps } from "@/types/bottom_drawer_note_details";

const BottomDrawerNoteDetails = React.forwardRef<
  BottomSheetModal,
  Omit<BottomDrawerNoteDetailsProps, "ref">
>(({ note }, ref) => {
  const theme = useColorScheme();

  const { data: notebookData, isLoading: isLoadingNotebookData } = useQuery({
    queryKey: ["notebook", note?.notebook_id],
    queryFn: () => getNotebookById(note?.notebook_id!),
    enabled: !!note?.notebook_id,
  });

  const closeDrawer = () => {
    (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
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
        ref={ref}
        backdropComponent={() => (
          <TouchableOpacity
            style={[styles.backdrop]}
            activeOpacity={1}
            onPress={closeDrawer}
          />
        )}
        backgroundStyle={{
          backgroundColor: colors[theme].background,
        }}
        handleIndicatorStyle={{
          backgroundColor: colors[theme].grayscale,
        }}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.detailsContainer}>
            <Text style={styles.detail} disabled>
              Created at{" "}
              {note?.created_at ? formatLongDate(note.created_at) : ""}
            </Text>
            <Text style={styles.detail} disabled>
              Last update at{" "}
              {note?.updated_at ? formatLongDate(note.updated_at) : ""}
            </Text>
            <Text style={styles.detail} disabled>
              {isLoadingNotebookData
                ? "Loading category..."
                : notebookData
                ? `Categorized as ${notebookData?.name}`
                : "Uncategorized"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={closeDrawer}
            style={styles.button}
            customBackgroundColor={colors[theme].primary}
          >
            <Text customTextColor={colors.dark.text}>Close</Text>
          </TouchableOpacity>
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
  contentContainer: {
    padding: 16,
    gap: 20,
  },
  detailsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  detail: {
    textAlign: "center",
    fontSize: 14,
  },
  button: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    width: "80%",
    alignSelf: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BottomDrawerNoteDetails;
