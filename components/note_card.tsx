import { StyleSheet, useColorScheme } from "react-native";
import { Text, View } from "./themed";
import colors from "@/constants/colors";
import { formatLongDate } from "@/lib/format_date";

export default function NoteCard({ note }: { note: Note }) {
  const colorScheme = useColorScheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colorScheme === "light" ? colors.light.foggy2 : colors.dark.foggy2,
        },
      ]}
    >
      <Text style={styles.title} numberOfLines={1}>
        {note.title}
      </Text>
      <Text style={styles.content} numberOfLines={3}>
        {note.content}
      </Text>
      <Text
        style={[
          styles.date,
          {
            color:
              colorScheme === "light"
                ? colors.light.text_muted
                : colors.dark.text_muted,
          },
        ]}
        numberOfLines={1}
      >
        {formatLongDate(note.created_at)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    height: 140,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
  },
  content: {
    fontSize: 12,
  },
  date: {
    marginTop: "auto",
    fontSize: 12,
  },
});
