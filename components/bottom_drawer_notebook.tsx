import React from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Text, TouchableOpacity, View } from "./themed";
import { Image, Keyboard, StyleSheet } from "react-native";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import NotebookCard from "./notebook_card";
import { BottomDrawerNotebookProps } from "@/types/bottom_drawer_notebook";
import Icon from "./icon";
import { LinearGradient } from "expo-linear-gradient";
import ColorPickerComponent from "./color_picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const colorsOptions = ["#FF5781", "#E76F51", "#00838F"];

const imageOptions = [
  require("@/assets/notebooks/notebook_1.png"),
  require("@/assets/notebooks/notebook_2.png"),
  require("@/assets/notebooks/notebook_3.png"),
];

const BottomDrawerNotebook = React.forwardRef<
  BottomSheetModal,
  Omit<BottomDrawerNotebookProps, "ref">
>(
  (
    {
      title,
      description,
      defaultName = "",
      defaultBackground = colorsOptions[0],
      onSubmit,
    },
    ref
  ) => {
    const theme = useColorScheme();
    const [background, setBackground] = React.useState(defaultBackground);
    const [name, setName] = React.useState(defaultName);
    const [showColorPickerModal, setShowColorPickerModal] = React.useState(
      false
    );

    const closeDrawer = () => {
      (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
      setBackground(defaultBackground);
      setName(defaultName);
    };

    const handlePickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;

        const backgroundsDir = `${FileSystem.documentDirectory}notebook-backgrounds/`;
        await FileSystem.makeDirectoryAsync(backgroundsDir, {
          intermediates: true,
        });

        const fileName = `notebook_background_${Date.now()}.jpg`;
        const newUri = `${backgroundsDir}${fileName}`;

        await FileSystem.copyAsync({ from: uri, to: newUri });

        setBackground(newUri);
      }
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

    return (
      <BottomSheetModalProvider>
        <BottomSheetModal
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

              {imageOptions.map((image) => (
                <TouchableOpacity
                  key={image}
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
                <Image
                  source={require("@/assets/notebooks/notebook_select.png")}
                  style={styles.image}
                />
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
                  { backgroundColor: colors[theme].foggier },
                ]}
                placeholder="Type a name for your notebook..."
              />
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  input: {
    width: "100%",
    maxWidth: 280,
    height: 40,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
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

export default BottomDrawerNotebook;
