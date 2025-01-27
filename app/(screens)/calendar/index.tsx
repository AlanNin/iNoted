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
import { FlashList } from "@shopify/flash-list";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import { getMaxDateInUTC } from "@/lib/format_date";
import NoteCard from "@/components/note_card";
import { useQuery } from "@tanstack/react-query";
import { getAllNotesCalendar } from "@/queries/notes";
import Loader from "@/components/loading";
import { Calendar } from "react-native-calendars";
import { ScrollView } from "moti";

const MemoizedNoteCard = React.memo(NoteCard);
const EmptyNotesView = React.memo(({ message }: { message: string }) => (
  <View style={styles.noNotesContainer}>
    <Icon name="Microscope" size={24} strokeWidth={1} muted />
    <Text style={styles.noNotesText} disabled>
      {message}
    </Text>
  </View>
));

const LoadingView = React.memo(() => (
  <View style={styles.loadingContainer}>
    <Loader />
    <Text style={styles.loadingText}>Loading notes...</Text>
  </View>
));

export default function CalendarScreen() {
  const { data: notesData, isLoading: isLoadingNotesData } = useQuery({
    queryKey: ["notes_calendar"],
    queryFn: getAllNotesCalendar,
    select: (data) => data ?? [],
  });
  const theme = useColorScheme();
  const navigation = useNavigation();
  const openMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  const [isCalendarModalOpen, setIsCalendarModalOpen] = React.useState(false);
  const [date, setDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const handleCloseModal = React.useCallback(() => {
    setIsCalendarModalOpen(false);
  }, []);

  const filteredNotes = React.useMemo(() => {
    if (!notesData) return [];

    const selectedDateNotes = notesData.find((item) =>
      item.date.includes(date)
    );
    return selectedDateNotes ? selectedDateNotes.notes : [];
  }, [date, notesData]);

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

  const renderNote = React.useCallback(
    ({ item, index }: { item: NoteProps; index: number }) => (
      <MemoizedNoteCard
        note={item}
        viewMode="grid"
        index={index}
        selectDisabled={true}
        dateType="hour"
      />
    ),
    []
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
            <TouchableOpacity onPress={openMenu}>
              <Icon
                name="Menu"
                size={20}
                strokeWidth={1.8}
                style={{ marginTop: 2 }}
              />
            </TouchableOpacity>
            <Text style={styles.title}>Calendar</Text>
          </View>
          <ScrollView
            contentContainerStyle={{
              flex: isLoadingNotesData || filteredNotes.length === 0 ? 1 : 0,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Calendar
                key={theme}
                onDayPress={(day) => setDate(day.dateString)}
                markedDates={{
                  [date]: {
                    selected: true,
                    disableTouchEvent: true,
                    selectedColor: colors[theme].primary,
                    color: colors[theme].primary,
                  },
                }}
                theme={{
                  monthTextColor: colors[theme].text,
                  arrowColor: colors[theme].primary,
                  calendarBackground: colors[theme].calendar_background,
                  textSectionTitleColor: colors[theme].text,
                  selectedDayBackgroundColor: colors[theme].primary,
                  todayTextColor: colors[theme].primary,
                  dayTextColor: colors[theme].text,
                  textDisabledColor: colors[theme].foggy,
                }}
                style={[
                  styles.calendar,
                  { backgroundColor: colors[theme].calendar_background },
                ]}
                maxDate={getMaxDateInUTC()}
              />

              {!isLoadingNotesData && filteredNotes.length > 0 && (
                <Text style={styles.labelNotes} disabled>
                  Your Notes
                </Text>
              )}

              <View style={styles.notesContent}>
                {isLoadingNotesData ? (
                  <LoadingView />
                ) : (
                  <>
                    {filteredNotes.length === 0 ? (
                      <EmptyNotesView message="No notes found" />
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
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
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
    paddingHorizontal: 28,
    marginTop: 8,
    paddingVertical: 20,
    borderBottomWidth: 1,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: 16,
    paddingVertical: 28,
    overflowY: "scroll",
    gap: 28,
  },
  calendar: {
    borderRadius: 8,
    padding: 12,
    borderColor: "rgba(105, 105, 105, 0.25)",
    borderWidth: 1,
  },
  labelNotes: {
    textAlign: "center",
  },
  notesContent: {
    flex: 1,
    marginHorizontal: -8,
    gap: 8,
  },
  noNotesContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
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
  },
  loadingText: {
    fontSize: 16,
    alignSelf: "center",
  },
});
