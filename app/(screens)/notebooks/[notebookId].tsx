import Icon from "@/components/icon";
import { MotiView, Text, TouchableOpacity, View } from "@/components/themed";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import { getNotebookById } from "@/queries/notebooks";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import {
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { Image } from "expo-image";
import NotebookCard from "@/components/notebook_card";
import { formatMediumDate } from "@/lib/format_date";
import { LinearGradient } from "expo-linear-gradient";
import NoteCard from "@/components/note_card";
import { FlashList } from "@shopify/flash-list";
import { createNote } from "@/queries/notes";
import useAppConfig from "@/hooks/useAppConfig";

export default function NotebookScreen() {
  const { notebookId } = useLocalSearchParams();
  const [isMoreModalOpen, setIsMoreModalOpen] = React.useState(false);
  const theme = useColorScheme();
  const [isFirstNote, saveIsFirstNote] = useAppConfig<boolean>(
    "isFirstNote",
    true
  );

  function getDifumColor(opacity: number) {
    const difuminationColor =
      theme === "light" ? "242, 243, 244" : "15, 15, 15";

    return `rgba(${difuminationColor}, ${opacity})`;
  }

  const { data: notebookData, isLoading: isLoadingNotebookData } = useQuery({
    queryKey: ["note", Number(notebookId)],
    queryFn: () => getNotebookById(Number(notebookId)),
    enabled: !!notebookId,
  });

  const isBackgroundAColor =
    typeof notebookData?.background === "string" &&
    notebookData?.background.includes("#");

  const colorSource = isLoadingNotebookData
    ? colors.dark.grayscale
    : isBackgroundAColor
    ? notebookData?.background
    : "transparent";

  const imageSource =
    typeof notebookData?.background === "string" &&
    notebookData?.background.startsWith("file:")
      ? { uri: notebookData?.background }
      : (notebookData?.background as any);

  const renderItem = ({ item, index }: { item: NoteProps; index: number }) => (
    <NoteCard
      key={`${item.id}-${item.title}-${item.content}`}
      note={item}
      viewMode={"grid"}
      index={index}
      selectDisabled={true}
    />
  );

  const handleNewNote = async () => {
    const newNote = await createNote({
      title: "",
      content: "",
      notebook_id: notebookData?.id || null,
    });

    if (isFirstNote) {
      saveIsFirstNote(false);
    }

    router.push(`notes/${newNote[0].id}`);
  };

  if (isLoadingNotebookData) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{}}
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback
          onPress={() => setIsMoreModalOpen(false)}
          style={{ backgroundColor: colors[theme].background }}
        >
          <View style={styles.difumBackgroundContainer}>
            {isBackgroundAColor ? (
              <>
                <View
                  style={styles.backgroundImage}
                  customBackgroundColor={colorSource}
                />
              </>
            ) : (
              <Image
                source={imageSource}
                style={styles.backgroundImage}
                blurRadius={3}
              />
            )}

            <LinearGradient
              colors={[
                getDifumColor(1),
                getDifumColor(0.8),
                getDifumColor(0.5),
                getDifumColor(0.2),
                getDifumColor(0),
              ]}
              style={styles.gradientTop}
            />
            <LinearGradient
              colors={[
                getDifumColor(0),
                getDifumColor(0.2),
                getDifumColor(0.5),
                getDifumColor(0.8),
                getDifumColor(1),
              ]}
              style={styles.gradientBottom}
            />
          </View>
          <View style={styles.header} customBackgroundColor="transparent">
            <TouchableOpacity
              style={styles.headerButton}
              customBackgroundColor="rgba(0,0,0,0.5)"
              onPress={() => router.back()}
            >
              <Icon name="ArrowLeft" size={20} customColor={colors.dark.tint} />
            </TouchableOpacity>
            <View
              style={styles.moreContainer}
              customBackgroundColor="transparent"
            >
              <TouchableOpacity
                style={styles.headerButton}
                customBackgroundColor="rgba(0,0,0,0.5)"
              >
                <Icon
                  name="EllipsisVertical"
                  size={20}
                  customColor={colors.dark.tint}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={styles.photoAndTitleContainer}
            customBackgroundColor="transparent"
          >
            <View
              customBackgroundColor="transparent"
              style={{ marginBottom: -16, marginHorizontal: -8 }}
            >
              <NotebookCard
                notebook={{
                  name: notebookData?.name || "Untitled",
                  background: isBackgroundAColor ? colorSource : imageSource,
                }}
                isAdding
                isLoading={isLoadingNotebookData}
                onPress={() => {}}
                disabled={true}
                numberOfLinesName={2}
                mini={true}
                showName={false}
              />
            </View>
            <View
              style={styles.nameContainer}
              customBackgroundColor="transparent"
            >
              <Text style={styles.name}>
                {notebookData?.name || "Untitled"}
              </Text>
              <Text style={styles.creation}>
                Created on {formatMediumDate(notebookData?.created_at || "")}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.detailsContainer}>
          <View style={styles.detail}>
            <Icon
              name="Calendar1"
              size={20}
              customColor={colors[theme].grayscale}
            />
            <Text
              style={styles.detailTxt}
              customTextColor={colors[theme].grayscale}
            >
              {formatMediumDate(notebookData?.updated_at || "")}
            </Text>
          </View>
          <View style={styles.detail}>
            <Icon
              name="NotepadText"
              size={20}
              customColor={colors[theme].grayscale}
            />
            <Text
              style={styles.detailTxt}
              customTextColor={colors[theme].grayscale}
            >
              {notebookData?.notes.length} notes
            </Text>
          </View>
          {/* <TouchableOpacity style={styles.detail}>
            <Icon
              name="SquarePen"
              size={20}
              customColor={colors[theme].grayscale}
            />
            <Text
              style={styles.detailTxt}
              customTextColor={colors[theme].grayscale}
            >
              Edit
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.detail} onPress={handleNewNote}>
            <Icon
              name="CirclePlus"
              size={20}
              customColor={colors[theme].grayscale}
            />
            <Text
              style={styles.detailTxt}
              customTextColor={colors[theme].grayscale}
            >
              New Note
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.notesContainer}></View>
        <Text style={styles.notesTxt} disabled>
          Your notes
        </Text>
        <View style={styles.notes}>
          <FlashList
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) =>
              item.id ? item.id?.toString() : `placeholder-${index}`
            }
            data={notebookData?.notes}
            renderItem={renderItem}
            numColumns={3}
            removeClippedSubviews={true}
            estimatedItemSize={212}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    padding: 16,
    zIndex: 2,
  },
  difumBackgroundContainer: {
    position: "relative",
    minHeight: 220,
    width: "100%",
  },
  backgroundImage: {
    flex: 1,
  },
  gradientTop: {
    position: "absolute",
    top: 0,
    width: "100%",
    minHeight: 20,
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    minHeight: 20,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: 16,
    marginTop: 12,
    paddingHorizontal: 24,
  },
  headerButton: {
    padding: 6,
    borderRadius: 9999,
  },
  photoAndTitleContainer: {
    position: "absolute",
    bottom: -80,
    left: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    width: "100%",
    padding: 16,
    gap: 20,
  },
  nameContainer: {
    paddingVertical: 12,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  creation: {
    fontSize: 12,
  },
  moreContainer: {
    position: "relative",
  },
  detailsContainer: {
    marginTop: 88,
    padding: 16,
    paddingBottom: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  detail: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 1,
  },
  detailTxt: {
    fontSize: 12,
  },
  notesContainer: {
    paddingTop: 8,
    paddingBottom: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  notesTxt: {
    textAlign: "center",
    marginBottom: 24,
  },
  notes: {
    flex: 1,
    paddingHorizontal: 8,
  },
});
