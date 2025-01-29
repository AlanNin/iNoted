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
import { BottomDrawerThemeProps } from "@/types/bottom_drawer_theme";
import Icon from "./icon";

const BottomDrawerTheme = React.forwardRef<
  BottomSheetModal,
  Omit<BottomDrawerThemeProps, "ref">
>(
  (
    {
      title,
      description,
      themes,
      selectedTheme,
      setSelectedTheme,
      onApply,
      onCancel,
      isApplyDisabled,
    },
    ref
  ) => {
    const theme = useColorScheme();

    const closeDrawer = () => {
      (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
    };

    const handleCancel = () => {
      onCancel();
      closeDrawer();
    };

    const handleSubmit = () => {
      onApply(selectedTheme);
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
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
            <View style={styles.themesContainer}>
              {themes.map((themeItem) => (
                <TouchableOpacity
                  key={themeItem}
                  style={[
                    styles.itemsButton,
                    themeItem === selectedTheme && {
                      backgroundColor: colors[theme].primary_dark,
                    },
                  ]}
                  onPress={() => {
                    setSelectedTheme(themeItem);
                  }}
                >
                  <View style={styles.itemButtonDetails}>
                    <View style={styles.itemButtonDetailsTxts}>
                      <Text
                        customTextColor={
                          themeItem === selectedTheme
                            ? colors.dark.text
                            : colors[theme].text
                        }
                      >
                        {themeItem.charAt(0).toUpperCase() +
                          themeItem.slice(1).toLowerCase()}
                      </Text>
                      <Text
                        style={styles.itemButtonDetailsDescription}
                        customTextColor={colors.dark.text_bit_muted}
                      >
                        {themeItem === selectedTheme ? "Selected" : ""}
                      </Text>
                    </View>
                    {themeItem === selectedTheme && (
                      <Icon
                        name="CircleCheckBig"
                        size={20}
                        strokeWidth={1}
                        customColor={colors.dark.tint}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
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
  header: {
    flexDirection: "column",
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginTop: -8,
  },
  themesContainer: {
    marginTop: 12,
    flexDirection: "column",
    gap: 12,
  },
  itemsButton: {
    padding: 16,
    borderRadius: 8,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  itemButtonDetails: {
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  itemButtonDetailsTxts: {
    backgroundColor: "transparent",
    flexDirection: "column",
    gap: 4,
  },
  itemButtonDetailsDescription: {
    fontSize: 12,
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

export default BottomDrawerTheme;
