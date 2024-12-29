import React from "react";
import { BackHandler, StyleSheet } from "react-native";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "@/components/themed";
import Icon from "@/components/icon";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import CalendarSection from "@/components/calendar_section";
import { FlashList } from "@shopify/flash-list";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import CalendarModal from "@/components/calendar_modal";
import { formatMediumDate } from "@/lib/format_date";
import NoteCard from "@/components/note_card";
import { useQuery } from "@tanstack/react-query";
import { getAllNotesCalendar } from "@/queries/notes";
import Loader from "@/components/loading";

export default function CalendarScreen() {
  const { data: notesData, isLoading: isLoadingNotesData } = useQuery({
    queryKey: ["notes_calendar"],
    queryFn: getAllNotesCalendar,
  });

  const theme = useColorScheme();
  const navigation = useNavigation();
  const openMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  const [isCalendarModalOpen, setIsCalendarModalOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState("");

  function handleCloseModal() {
    setIsCalendarModalOpen(false);
  }

  function handleApplyModal(date: string) {
    setSelectedDate(date);
    setIsCalendarModalOpen(false);
  }

  function handleClearModal() {
    setSelectedDate("");
    setIsCalendarModalOpen(false);
  }

  const filteredNotes = React.useMemo(() => {
    const selectedDateNotes = notesData?.find((item) =>
      item.date.includes(selectedDate)
    );

    return selectedDateNotes ? selectedDateNotes.notes : [];
  }, [selectedDate, notesData]);

  React.useEffect(() => {
    const backAction = () => {
      if (isCalendarModalOpen) {
        handleCloseModal();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isCalendarModalOpen]);

  const renderSection = ({ item }: { item: CalendarSectionProps }) => (
    <CalendarSection key={`${item.date}`} notes={item.notes} date={item.date} />
  );

  const renderNote = ({ item, index }: { item: NoteProps; index: number }) => (
    <NoteCard
      key={`${item.id}-${item.title}-${item.content}`}
      note={item}
      viewMode={"grid"}
      index={index}
    />
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.wrapper}>
          <View
            style={[
              styles.header,
              { borderBottomColor: colors[theme].foggier },
            ]}
          >
            <TouchableOpacity onPress={openMenu} style={styles.headerButton}>
              <Icon name="Menu" size={16} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Calendar</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsCalendarModalOpen(true)}
              style={styles.headerButton}
            >
              <Icon name="Filter" size={16} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <>
              {isLoadingNotesData ? (
                <View style={styles.loadingContainer}>
                  <Loader />
                  <Text style={styles.loadingText}>Loading notes...</Text>
                </View>
              ) : (
                <>
                  {selectedDate ? (
                    <View style={styles.notesContent}>
                      <TouchableOpacity
                        style={styles.selectedDateButton}
                        customBackgroundColor={colors[theme].primary_dark}
                        onPress={() => setSelectedDate("")}
                      >
                        <Text
                          style={styles.selectedDateText}
                          customTextColor={colors.dark.text}
                        >
                          {formatMediumDate(selectedDate)}
                        </Text>
                        <Icon
                          name="X"
                          size={16}
                          strokeWidth={2}
                          customColor={colors.dark.text}
                        />
                      </TouchableOpacity>

                      {filteredNotes.length === 0 ? (
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
                      ) : (
                        <FlashList
                          showsVerticalScrollIndicator={false}
                          keyExtractor={(item) => item.id.toString()}
                          data={filteredNotes}
                          renderItem={renderNote}
                          numColumns={3}
                          removeClippedSubviews={true}
                          estimatedItemSize={240}
                        />
                      )}
                    </View>
                  ) : (
                    <>
                      {filteredNotes.length === 0 ? (
                        <View style={styles.noNotesContainer}>
                          <Icon
                            name="Microscope"
                            size={24}
                            strokeWidth={1}
                            muted
                          />
                          <Text style={styles.noNotesText} disabled>
                            You haven't created any notes yet. Start by adding
                            your first one!
                          </Text>
                        </View>
                      ) : (
                        <FlashList
                          showsVerticalScrollIndicator={false}
                          keyExtractor={(item) => item.date?.toString()}
                          data={notesData}
                          renderItem={renderSection}
                          numColumns={1}
                          removeClippedSubviews={true}
                          estimatedItemSize={240}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </>
          </View>
        </View>
      </SafeAreaView>
      {isCalendarModalOpen && (
        <CalendarModal
          onClose={handleCloseModal}
          onApply={handleApplyModal}
          onClear={handleClearModal}
          defaultDate={selectedDate}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100%",
  },
  wrapper: {
    flex: 1,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  headerButton: {
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectedDateButton: {
    marginVertical: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "center",
    display: "flex",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  selectedDateText: {
    fontSize: 14,
    textAlign: "center",
  },
  notesContent: {
    flex: 1,
    marginHorizontal: -8,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  noNotesContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
    marginBottom: "30%",
    paddingHorizontal: 16,
  },
  noNotesText: {
    fontSize: 16,
    alignSelf: "center",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
    marginBottom: "30%",
  },
  loadingText: {
    fontSize: 16,
    alignSelf: "center",
  },
});
