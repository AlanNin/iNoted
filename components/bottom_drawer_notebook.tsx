import React from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Text, TouchableOpacity, View } from "./themed";
import { BackHandler, Dimensions, Keyboard, StyleSheet } from "react-native";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import NotebookCard from "./notebook_card";
import Icon from "./icon";
import { LinearGradient } from "expo-linear-gradient";
import ColorPickerComponent from "./color_picker";
import { pickImage } from "@/lib/pick_image";
import { useQuery } from "@tanstack/react-query";
import { getNotebookById, removeNoteFromNotebook } from "@/queries/notebooks";
import NoteCard from "./note_card";
import Loader from "./loading";
import { FlashList } from "@shopify/flash-list";
import BottomDrawerConfirm from "./bottom_drawer_confirm";
import { useNotesEditMode } from "@/hooks/useNotesEditMode";
import { toast } from "@backpackapp-io/react-native-toast";
import { Image } from "expo-image";

const colorsOptions = ["#FF5781", "#E76F51", "#00838F"];

const imageOptions = ["notebook_1", "notebook_2", "notebook_3"];

const BottomDrawerNotebook = React.forwardRef<
  BottomSheetModal,
  Omit<BottomDrawerNotebookProps, "ref">
>(({ notebookId, onSubmit, onDelete }, ref) => {
  const theme = useColorScheme();
  const [background, setBackground] = React.useState(colors.dark.grayscale);
  const [name, setName] = React.useState("Loading...");
  const [showColorPickerModal, setShowColorPickerModal] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const bottomDeleteDrawerRef = React.useRef<BottomSheetModal>(null);
  const bottomRemoveNotesDrawerRef = React.useRef<BottomSheetModal>(null);
  const nameMaxLength = 14;
  const {
    isNotesEditMode,
    setNotesEditMode,
    selectedNotes,
  } = useNotesEditMode();

  function toggleEditing() {
    setIsEditing(!isEditing);
  }

  const {
    data: notebook,
    isLoading: isLoadingNotebook,
    refetch: refetchNotebook,
  } = useQuery({
    queryKey: ["notebook", notebookId],
    queryFn: () => getNotebookById(notebookId!),
  });

  React.useEffect(() => {
    if (notebook) {
      setName(notebook.name);
      setBackground(notebook.background);
    }
  }, [notebook]);

  const closeDrawer = () => {
    (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
    if (notebook) {
      setName(notebook.name);
      setBackground(notebook.background);
    }
    setIsEditing(false);
    setNotesEditMode(false);
  };

  const handleDeleteNotebook = () => {
    onDelete(notebook!.id);
    closeDrawer();
  };

  const handlePickImage = async () => {
    await pickImage({
      onPick: (uri) => setBackground(uri),
    });
  };

  const handleRemoveNoteFromNotebook = async () => {
    await removeNoteFromNotebook({ noteIds: selectedNotes });
    refetchNotebook();
    closeDrawer();
  };

  const handleSubmit = () => {
    onSubmit({
      id: notebook!.id,
      name: name || "Untitled",
      background: background,
    });
    closeDrawer();
    refetchNotebook();
  };

  const handleToggleBottomDeleteDrawer = () => {
    bottomDeleteDrawerRef.current?.present();
  };

  const handleToggleBottomRemoveNotesDrawer = () => {
    bottomRemoveNotesDrawerRef.current?.present();
  };

  const [sheetStatus, setSheetStatus] = React.useState<"open" | "close">(
    "close"
  );

  React.useEffect(() => {
    const keyboardListener = Keyboard.addListener("keyboardDidHide", () => {
      (ref as React.RefObject<BottomSheetModal>).current?.snapToIndex(0);
    });

    return () => {
      keyboardListener.remove();
    };
  }, []);

  React.useEffect(() => {
    const backAction = () => {
      if (isNotesEditMode) {
        setNotesEditMode(false);
        return true;
      }

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

  const { width } = Dimensions.get("screen");

  const renderNote = ({ item, index }: { item: NoteProps; index: number }) => (
    <NoteCard
      key={`${item.id}-${item.title}-${item.content}`}
      note={item}
      viewMode={"grid"}
      index={index}
      onPress={() => closeDrawer()}
    />
  );

  return (
    <>
      <BottomSheetModalProvider>
        <BottomSheetModal
          stackBehavior="push"
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
              notebook &&
              notebook.notes &&
              notebook.notes.length > 0 &&
              !isEditing
                ? { minHeight: 564 }
                : { minHeight: 0 },
            ]}
          >
            {isNotesEditMode ? (
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleToggleBottomRemoveNotesDrawer}
                >
                  <Text customTextColor={colors[theme].primary}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setNotesEditMode(false)}
                >
                  <Text customTextColor={colors[theme].primary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleToggleBottomDeleteDrawer}
                >
                  <Text customTextColor={colors[theme].primary}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={toggleEditing}
                >
                  <Text customTextColor={colors[theme].primary}>
                    {isEditing ? "Cancel" : "Edit"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.bookContainer}>
              <NotebookCard
                notebook={{ name: name || "Untitled", background: background }}
                isAdding
                isLoading={isLoadingNotebook}
                onPress={() => {}}
                disabled={true}
                numberOfLinesName={2}
              />
            </View>

            {isEditing ? (
              <>
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
                    defaultValue={name}
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
                  <TouchableOpacity
                    onPress={handleSubmit}
                    style={styles.button}
                  >
                    <Text style={{ color: colors[theme].primary }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {isLoadingNotebook ? (
                  <View style={styles.loadingContainer}>
                    <Loader />
                    <Text style={styles.loadingText}>Loading notes...</Text>
                  </View>
                ) : (
                  <>
                    {notebook?.notes && notebook.notes.length > 0 ? (
                      <>
                        <Text style={styles.notesLabel} disabled>
                          Your notes
                        </Text>
                        <View style={styles.notesContainer}>
                          <FlashList
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item) => item.id?.toString()}
                            data={notebook?.notes || []}
                            renderItem={renderNote}
                            numColumns={3}
                            estimatedItemSize={width > 400 ? 180 : 156}
                            removeClippedSubviews={true}
                          />
                        </View>
                      </>
                    ) : (
                      <View style={styles.noNotesContainer}>
                        <Icon
                          name="Microscope"
                          size={24}
                          strokeWidth={1}
                          muted
                        />
                        <Text style={styles.noNotesText} disabled>
                          No notes found
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </>
            )}
          </BottomSheetView>
        </BottomSheetModal>
        <ColorPickerComponent
          showModal={showColorPickerModal}
          setShowModal={setShowColorPickerModal}
          setBackground={setBackground}
        />
      </BottomSheetModalProvider>
      <BottomDrawerConfirm
        ref={bottomDeleteDrawerRef}
        title="Delete this notebook?"
        description="This notebook will be permanently deleted from this device."
        submitButtonText="Delete"
        onSubmit={handleDeleteNotebook}
      />
      <BottomDrawerConfirm
        ref={bottomRemoveNotesDrawerRef}
        title="Remove selected notes from this notebook?"
        description={`The selected notes will be removed from this notebook. You have selected ${selectedNotes.length} notes.`}
        submitButtonText="Remove"
        onSubmit={handleRemoveNoteFromNotebook}
        onCancel={() => setNotesEditMode(false)}
      />
    </>
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
    gap: 20,
    flex: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },
  headerButton: {
    padding: 4,
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
  notesLabel: {
    fontSize: 16,
    textAlign: "center",
    marginTop: -8,
  },
  notesContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  noNotesContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    alignSelf: "center",
  },
});

export default BottomDrawerNotebook;
