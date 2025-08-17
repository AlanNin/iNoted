import React from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Text, TouchableOpacity, View } from "../themed";
import { BackHandler, Keyboard, StyleSheet } from "react-native";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import NotebookCard from "../notebook_card";
import Icon from "../icon";
import { LinearGradient } from "expo-linear-gradient";
import ColorPickerComponent from "../color_picker";
import { pickImage } from "@/lib/pick_image";
import { Image } from "expo-image";

const colorsOptions = ["#FF5781", "#E76F51", "#00838F"];

const localImageOptions = ["notebook_1", "notebook_2", "notebook_3"];

const BottomDrawerCreateNotebook = React.forwardRef<
  BottomSheetModal,
  Omit<BottomDrawerCreateNotebookProps, "ref">
>(({ title, description, onSubmit }, ref) => {
  const theme = useColorScheme();
  const [background, setBackground] = React.useState(colorsOptions[0]);
  const [name, setName] = React.useState("");
  const [showColorPickerModal, setShowColorPickerModal] = React.useState(false);
  const nameMaxLength = 14;

  const closeDrawer = () => {
    (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
    setBackground(colorsOptions[0]);
    setName("");
  };

  const handlePickImage = async () => {
    await pickImage({
      onPick: (uri) => setBackground(uri),
    });
  };

  const handleSubmit = () => {
    onSubmit({ name: name || "Untitled", background: background });
    closeDrawer();
  };

  React.useEffect(() => {
    const keyboardListener = Keyboard.addListener("keyboardDidHide", () => {
      (ref as React.RefObject<BottomSheetModal>).current?.snapToIndex(0);
    });

    return () => {
      keyboardListener.remove();
    };
  }, []);

  const [sheetStatus, setSheetStatus] = React.useState<"open" | "close">(
    "close"
  );

  React.useEffect(() => {
    const backAction = () => {
      if (showColorPickerModal) {
        setShowColorPickerModal(false);
        return true;
      }
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
  }, [
    showColorPickerModal,
    setShowColorPickerModal,
    sheetStatus,
    setSheetStatus,
  ]);

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
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {description && (
              <Text style={styles.description} disabled>
                {description}
              </Text>
            )}
          </View>
          <View style={styles.bookContainer}>
            <NotebookCard
              notebook={{ name: name || "Untitled", background: background }}
              isAdding
              numberOfLinesName={2}
            />
          </View>

          <View style={styles.backgroundsContainer}>
            {colorsOptions.map((color) => (
              <TouchableOpacity
                key={color}
                style={styles.color}
                customBackgroundColor={color}
                onPress={() => setBackground(color)}
              />
            ))}
            <TouchableOpacity
              key="select-color"
              style={styles.selectContainer}
              onPress={() => setShowColorPickerModal(true)}
            >
              <LinearGradient
                colors={["#4A00E0", "#8E2DE2"]}
                style={styles.selectContainer}
              />
              <Icon
                name="Palette"
                size={12}
                customColor={colors[theme].tint}
                style={styles.selectIcon}
              />
            </TouchableOpacity>

            {localImageOptions.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={styles.imageContainer}
                onPress={() => setBackground(image)}
              >
                <Image source={image} style={styles.image} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              key="select-image"
              style={styles.selectContainer}
              onPress={handlePickImage}
            >
              <Image source={"notebook_select"} style={styles.image} />
              <Icon
                name="Image"
                size={12}
                customColor={colors[theme].tint}
                style={styles.selectIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <BottomSheetTextInput
              onChange={(e) => setName(e.nativeEvent.text)}
              style={[
                styles.input,
                {
                  backgroundColor: colors[theme].foggier,
                  color: colors[theme].text,
                },
              ]}
              maxLength={nameMaxLength}
              placeholderTextColor={colors[theme].text_muted}
              placeholder="Type a name for your notebook..."
            />
            <Text style={styles.inputCounter}>
              {name.length}/{nameMaxLength}
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={() => closeDrawer()}
              style={styles.button}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            <View
              style={styles.buttonsDivider}
              customBackgroundColor={colors[theme].foggy}
            />
            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
              <Text style={{ color: colors[theme].primary }}>Save</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      <ColorPickerComponent
        showModal={showColorPickerModal}
        setShowModal={setShowColorPickerModal}
        setBackground={setBackground}
      />
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
    padding: 16,
    gap: 20,
  },
  header: {
    flexDirection: "column",
    gap: 4,
    marginBottom: 4,
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
  bookContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundsContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    width: "100%",
    paddingHorizontal: 24,
    marginTop: -8,
    marginBottom: 8,
    justifyContent: "center",
  },
  color: {
    height: 24,
    width: 24,
    borderRadius: 9999,
  },
  imageContainer: {
    height: 24,
    width: 24,
    borderRadius: 9999,
  },
  image: {
    height: 24,
    width: 24,
    borderRadius: 9999,
    objectFit: "cover",
  },
  selectContainer: {
    height: 24,
    width: 24,
    borderRadius: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  selectGradient: {
    position: "absolute",
    inset: 0,
  },
  selectIcon: {
    position: "absolute",
    bottom: -16,
  },
  inputContainer: {
    display: "flex",
    gap: 8,
    paddingHorizontal: 20,
    alignSelf: "center",
    position: "relative",
    width: 280,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    maxWidth: 280,
    height: 40,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  inputCounter: {
    position: "absolute",
    right: 20,
    bottom: -20,
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

export default BottomDrawerCreateNotebook;
