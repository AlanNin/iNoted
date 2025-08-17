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
import { BottomDrawerConfirmProps } from "@/types/bottom_drawer_confirm";

const BottomDrawerConfirm = React.forwardRef<
  BottomSheetModal,
  Omit<BottomDrawerConfirmProps, "ref">
>(({ title, description, submitButtonText, onSubmit, onCancel }, ref) => {
  const theme = useColorScheme();

  const closeDrawer = () => {
    (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
  };

  const handleCancel = () => {
    onCancel?.();
    closeDrawer();
  };

  const handleSubmit = () => {
    onSubmit();
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
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={handleCancel} style={styles.button}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <View
              style={styles.buttonsDivider}
              customBackgroundColor={colors[theme].foggy}
            />
            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
              <Text style={{ color: colors[theme].primary }}>
                {submitButtonText}
              </Text>
            </TouchableOpacity>
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
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginVertical: 8,
  },
  buttonsDivider: {
    width: 1,
  },
  button: {
    padding: 4,
  },
});

export default BottomDrawerConfirm;
