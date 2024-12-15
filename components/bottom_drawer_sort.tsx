import React from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { Text, TouchableOpacity, View } from "./themed";
import { BackHandler, StyleSheet } from "react-native";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import Icon from "./icon";
import { BottomDrawerSortProps } from "@/types/bottom_drawer_sort";

const BottomDrawerSort = React.forwardRef<
  BottomSheetModal,
  Omit<BottomDrawerSortProps, "ref">
>(({ title, description, actions }, ref) => {
  const theme = useColorScheme();

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
        ref={ref}
        onChange={(status) => {
          if (status === 0) {
            setSheetStatus("open");
          } else {
            setSheetStatus("close");
          }
        }}
        backdropComponent={() => (
          <TouchableOpacity
            style={[styles.backdrop]}
            activeOpacity={1}
            onPress={() =>
              (ref as React.RefObject<BottomSheetModal>).current?.dismiss()
            }
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
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={`${action.title}-${index}`}
                onPress={() => action.action()}
                style={styles.actionsButton}
                customBackgroundColor={
                  action.isSelected ? colors[theme].foggiest : ""
                }
              >
                <Text style={styles.actionsButtonText}>{action.title}</Text>
                {action.isSelected && (
                  <View
                    style={styles.actionsButtonsIconContainer}
                    customBackgroundColor="transparent"
                  >
                    <Icon
                      name="MoveDown"
                      size={20}
                      customColor={
                        action.order === "desc"
                          ? colors[theme].primary
                          : colors[theme].text_muted
                      }
                      style={styles.actionsButtonsIcon}
                    />
                    <Icon
                      name="MoveUp"
                      size={20}
                      customColor={
                        action.order === "asc"
                          ? colors[theme].primary
                          : colors[theme].text_muted
                      }
                      style={styles.actionsButtonsIcon}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={() =>
              (ref as React.RefObject<BottomSheetModal>).current?.dismiss()
            }
            style={styles.closeButton}
            customBackgroundColor={colors[theme].primary}
          >
            <Text
              style={styles.closeButtonText}
              customTextColor={colors.dark.text}
            >
              Close
            </Text>
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  actionsButton: {
    padding: 16,
    borderRadius: 8,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  actionsButtonText: {
    marginRight: "auto",
    marginLeft: "auto",
  },
  actionsButtonsIconContainer: {
    marginLeft: -24,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  actionsButtonsIcon: {
    marginHorizontal: -4,
  },
  closeButton: {
    marginVertical: 8,
    padding: 12,
    width: "80%",
    textAlign: "center",
    borderRadius: 8,
    alignSelf: "center",
  },
  closeButtonText: {
    textAlign: "center",
  },
});

export default BottomDrawerSort;
