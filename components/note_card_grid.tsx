import { StyleSheet, useColorScheme } from "react-native";
import { Text, View } from "./themed";
import colors from "@/constants/colors";
import { formatMediumDate } from "@/lib/format_date";
import { memo } from "react";
import { MotiView } from "moti";

const NoteCardGrid = memo(({ note, index }: { note: Note; index?: number }) => {
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
      style={styles.container}
    >
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor:
              colorScheme === "light"
                ? colors.light.foggy3
                : colors.dark.foggy3,
          },
        ]}
      >
        <Text style={styles.content} numberOfLines={8}>
          {note.content}
        </Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {note.title}
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
          {formatMediumDate(note.created_at)}
        </Text>
      </View>
    </MotiView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    backgroundColor: "transparent",
    alignContent: "center",
    marginBottom: 16,
    marginHorizontal: 16,
  },
  contentContainer: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  content: {
    fontSize: 12,
  },
  detailsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
  },
  date: {
    fontSize: 12,
    textAlign: "center",
  },
});

export default NoteCardGrid;
