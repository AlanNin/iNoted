import { StyleSheet } from "react-native";
import { Text, View } from "./themed";
import useColorScheme from "@/hooks/useColorScheme";
import colors from "@/constants/colors";
import { FlashList } from "@shopify/flash-list";
import NoteCard from "./note_card";
import { formatMediumDateCalendar } from "@/lib/format_date";

export default function CalendarSection({ notes, date }: CalendarSectionProps) {
  const theme = useColorScheme();

  const renderItem = ({ item, index }: { item: NoteProps; index: number }) => (
    <View style={{ minHeight: 228, width: 140 }}>
      <NoteCard
        key={`${item.id}-${item.title}-${item.content}`}
        note={item}
        viewMode={"grid"}
        index={index}
      />
    </View>
  );

  return (
    <View style={styles.container}>
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
          keyExtractor={(item) => item.id.toString()}
          data={notes}
          renderItem={renderItem}
          horizontal={true}
          removeClippedSubviews={true}
          estimatedItemSize={212}
        />
      </View>
    </View>
  );
}

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
