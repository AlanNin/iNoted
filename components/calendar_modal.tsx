import { StyleSheet, TouchableWithoutFeedback } from "react-native";
import { MotiView, Text, TouchableOpacity, View } from "./themed";
import { Calendar } from "react-native-calendars";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import React from "react";
import { getMaxDateInUTC } from "@/lib/format_date";

export default function CalendarModal({
  onClose,
  onApply,
  onClear,
  defaultDate,
}: CalendarModalProps) {
  const theme = useColorScheme();
  const [date, setDate] = React.useState(defaultDate);

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <MotiView
        style={styles.backdrop}
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 150 }}
      >
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.container,
              { backgroundColor: colors[theme].background },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Choose a Date</Text>
              <Text style={styles.subtitle} disabled>
                Tap a day to filter your notes quickly
              </Text>
            </View>

            <Calendar
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
                calendarBackground: colors[theme].background,
                textSectionTitleColor: colors[theme].text,
                selectedDayBackgroundColor: colors[theme].primary,
                todayTextColor: colors[theme].primary,
                dayTextColor: colors[theme].text,
                textDisabledColor: colors[theme].foggy,
              }}
              style={styles.calendar}
              maxDate={getMaxDateInUTC()}
            />

            <View
              style={styles.divider}
              customBackgroundColor={colors[theme].foggier}
            />

            <View style={styles.buttonsContainer}>
              {defaultDate && (
                <TouchableOpacity
                  style={[styles.button, { opacity: date ? 1 : 0.7 }]}
                  onPress={() => onClear()}
                  disabled={!date}
                  customBackgroundColor={colors[theme].foggier}
                >
                  <Text
                    style={styles.buttonText}
                    customTextColor={colors[theme].text}
                  >
                    Clear
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, { opacity: date ? 1 : 0.7 }]}
                onPress={() => onApply(date)}
                disabled={!date}
                customBackgroundColor={colors[theme].primary}
              >
                <Text
                  style={styles.buttonText}
                  customTextColor={colors.dark.text}
                >
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </MotiView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 24,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: "90%",
    maxWidth: 400,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  calendar: {
    borderRadius: 8,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
  },
});
