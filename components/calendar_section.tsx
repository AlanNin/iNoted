import { Dimensions, StyleSheet } from "react-native";
import { MotiView, Text, View } from "./themed";
import useColorScheme from "@/hooks/useColorScheme";
import colors from "@/constants/colors";
import { FlashList } from "@shopify/flash-list";
import NoteCard from "./note_card";
import { formatMediumDateCalendar } from "@/lib/format_date";
import React from "react";

const MemoizedNoteCard = React.memo(NoteCard);

const CalendarSection = React.memo(function CalendarSection({
  notes,
  date,
  index,
  animated = true,
}: CalendarSectionProps) {
  const theme = useColorScheme();

  const { width } = Dimensions.get("screen");

  const renderItem = React.useCallback(
    ({ item, index }: { item: NoteProps; index: number }) => (
      <View style={{ height: 228, width: width > 400 ? 132 : 124 }}>
        <MemoizedNoteCard
          note={item}
          viewMode="grid"
          index={index}
          animated={false}
          selectDisabled={true}
        />
      </View>
    ),
    []
  );
  const delay = index ? (index + 1) * 50 : 0;

  const animationProps = animated
    ? ({
        from: { opacity: 0, translateY: 10 },
        animate: { opacity: 1, translateY: 0 },
        transition: {
          type: "timing",
          duration: 250,
          delay,
        },
      } as any)
    : {};

  return (
    <MotiView {...animationProps} style={styles.container}>
      <View style={styles.dateContainer}>
        <View
          style={styles.dot}
          customBackgroundColor={colors[theme].primary}
        />
        <Text style={[styles.date, { color: colors[theme].primary }]}>
          {formatMediumDateCalendar(date)}
        </Text>
      </View>

      <View style={styles.listContainer}>
        <FlashList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => `${item.id}-${item.title}-${item.content}`}
          data={notes}
          renderItem={renderItem}
          horizontal={true}
          removeClippedSubviews={true}
          estimatedItemSize={212}
        />
      </View>
    </MotiView>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 12,
    marginVertical: 8,
  },
  dateContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 9999,
    marginTop: 1,
  },
  date: {
    fontSize: 12,
  },
  listContainer: {
    marginHorizontal: -8,
  },
});

export default CalendarSection;
