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
import Icon from "../icon";
import { BottomDrawerOptionsProps } from "@/types/bottom_drawer_options";

const BottomDrawerOptions = React.forwardRef<
  BottomSheetModal,
  Omit<BottomDrawerOptionsProps, "ref">
>(
  (
    { title, description, options, selectedOption, handleSelectOption },
    ref
  ) => {
    const theme = useColorScheme();
    const [temporalSelection, setTemporalSelection] =
      React.useState<string>(selectedOption);
    const isApplyDisabled = temporalSelection === selectedOption;

    const closeDrawer = () => {
      (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
    };

    const handleCancel = () => {
      closeDrawer();
      setTemporalSelection(selectedOption);
    };

    const handleSubmit = () => {
      handleSelectOption(temporalSelection);
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
            {description && (
              <Text style={styles.description}>{description}</Text>
            )}
            <View style={styles.actionsContainer}>
              {options.map((option, index) => {
                const isSelected = option.key === temporalSelection;

                return (
                  <TouchableOpacity
                    key={`${option}-${index}`}
                    onPress={() => setTemporalSelection(option.key)}
                    style={styles.actionsButton}
                    customBackgroundColor={
                      isSelected ? colors[theme].foggiest : ""
                    }
                  >
                    {option.icon && (
                      <Icon
                        name={option.icon}
                        size={16}
                        customColor={
                          isSelected
                            ? colors[theme].tint
                            : colors[theme].text_muted
                        }
                      />
                    )}
                    <Text
                      customTextColor={
                        isSelected
                          ? colors[theme].tint
                          : colors[theme].text_muted
                      }
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity onPress={handleCancel} style={styles.button}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <View
                style={styles.buttonsDivider}
                customBackgroundColor={colors[theme].foggy}
              />
              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.button}
                disabled={isApplyDisabled}
              >
                <Text
                  style={{
                    color: isApplyDisabled
                      ? colors[theme].primary_foggy
                      : colors[theme].primary,
                  }}
                >
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    );
  }
);

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
    width: "100%",
    padding: 16,
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
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

export default BottomDrawerOptions;
