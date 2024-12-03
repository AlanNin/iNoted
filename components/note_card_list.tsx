import { StyleSheet, useColorScheme } from "react-native";
import { Text, View } from "./themed";
import colors from "@/constants/colors";
import { formatLongDate } from "@/lib/format_date";
import { memo } from "react";
import { MotiView } from "moti";

const NoteCardList = memo(({ note, index }: { note: Note; index?: number }) => {
  if (!note.id) {
    return <View style={styles.container} />;
  }

  const colorScheme = useColorScheme();

  const delay = index ? index * 50 : 0;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "timing",
        duration: 350,
        delay,
      }}
      style={[
        styles.container,
        {
          backgroundColor:
            colorScheme === "light" ? colors.light.foggy3 : colors.dark.foggy3,
        },
      ]}
    >
      <Text style={styles.title} numberOfLines={1}>
        {note.title}
      </Text>
      <Text style={styles.content} numberOfLines={2}>
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
    </MotiView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    height: 140,
    marginBottom: 16,
    marginHorizontal: 16,
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

export default NoteCardList;
