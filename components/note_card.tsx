import { StyleSheet } from "react-native";
import useColorScheme from "@/hooks/useColorScheme";
import { Text, View } from "./themed";
import colors from "@/constants/colors";
import { formatLongDate, formatMediumDate } from "@/lib/format_date";
import { memo } from "react";
import { MotiView } from "moti";

const NoteCardGrid = memo(
  ({
    note,
    index,
    viewMode,
  }: {
    note: NoteProps;
    index?: number;
    viewMode: "grid" | "list";
  }) => {
    if (!note.id) {
      return <View style={gridStyles.container} />;
    }

    const theme = useColorScheme();

    const delay = index ? index * 50 : 0;

    if (viewMode === "grid") {
      return (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "timing",
            duration: 250,
            delay,
          }}
          style={gridStyles.container}
        >
          <View
            style={[
              gridStyles.contentContainer,
              {
                backgroundColor:
                  theme === "light"
                    ? colors.light.foggiest
                    : colors.dark.foggiest,
              },
            ]}
          >
            <Text style={gridStyles.content} numberOfLines={8}>
              {note.content}
            </Text>
          </View>
          <View style={gridStyles.detailsContainer}>
            <Text style={gridStyles.title} numberOfLines={2}>
              {note.title}
            </Text>

            <Text
              style={[
                gridStyles.date,
                {
                  color:
                    theme === "light"
                      ? colors.light.grayscale
                      : colors.dark.grayscale,
                },
              ]}
              numberOfLines={1}
            >
              {formatMediumDate(note.created_at)}
            </Text>
          </View>
        </MotiView>
      );
    } else {
      return (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "timing",
            duration: 250,
            delay,
          }}
          style={[
            listStyles.container,
            {
              backgroundColor:
                theme === "light"
                  ? colors.light.foggiest
                  : colors.dark.foggiest,
            },
          ]}
        >
          <Text style={listStyles.title} numberOfLines={1}>
            {note.title}
          </Text>
          <Text style={listStyles.content} numberOfLines={2}>
            {note.content}
          </Text>
          <Text
            style={[
              listStyles.date,
              {
                color:
                  theme === "light"
                    ? colors.light.grayscale
                    : colors.dark.grayscale,
              },
            ]}
            numberOfLines={1}
          >
            {formatLongDate(note.created_at)}
          </Text>
        </MotiView>
      );
    }
  }
);

const gridStyles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    height: 216,
  },
  contentContainer: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  content: {
    fontSize: 12,
    flex: 1,
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

const listStyles = StyleSheet.create({
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

export default NoteCardGrid;
