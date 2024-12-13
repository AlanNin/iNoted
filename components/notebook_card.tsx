import { Image, StyleSheet } from "react-native";
import useColorScheme from "@/hooks/useColorScheme";
import { MotiView, Text, View } from "./themed";

import React from "react";

const NotebookCard = React.memo(
  ({ notebook, index, isAdding = false }: NoteBookCardProps) => {
    const isBackgroundAColor =
      typeof notebook.background === "string" &&
      notebook.background.includes("#");

    const delay = index ? index * 50 : 0;

    const animationProps = {
      from: { opacity: 0, translateY: 10 },
      animate: { opacity: 1, translateY: 0 },
      transition: {
        type: "timing",
        duration: 250,
        delay,
      },
    } as any;

    return (
      <MotiView
        {...animationProps}
        style={[styles.container, isAdding && { width: 120 }]}
      >
        <View
          style={[
            styles.book,
            {
              backgroundColor: isBackgroundAColor
                ? notebook.background
                : "transparent",
              shadowColor: isBackgroundAColor
                ? notebook.background
                : "transparent",
            },
          ]}
        >
          <View style={styles.nameContainer}>
            <Text style={styles.name} customTextColor="white" numberOfLines={1}>
              {notebook.name}
            </Text>
          </View>

          {!isBackgroundAColor && (
            <View style={styles.bookImageContainer}>
              <Image
                source={
                  typeof notebook.background === "string" &&
                  notebook.background.startsWith("file:")
                    ? { uri: notebook.background }
                    : (notebook.background as any)
                }
                style={styles.bookImage}
              />
            </View>
          )}
          <View style={styles.bookBorder} />
        </View>
      </MotiView>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.notebook.name === nextProps.notebook.name &&
      prevProps.notebook.background === nextProps.notebook.background
    );
  }
);

const styles = StyleSheet.create({
  container: {
    // height: 216,
    height: 180,
    flexGrow: 1,
    flexDirection: "column",
    gap: 8,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  book: {
    flex: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    elevation: 8,
    display: "flex",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bookBorder: {
    position: "absolute",
    inset: 0,
    borderWidth: 3,
    borderLeftWidth: 6,
    borderColor: "rgba(0, 0, 0, 0.15)",
    backgroundColor: "transparent",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  nameContainer: {
    position: "absolute",
    zIndex: 10,
    bottom: 24,
    right: -2,
    backgroundColor: "transparent",
    overflow: "hidden",
    width: "95%",
  },
  name: {
    fontWeight: "bold",
    letterSpacing: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 4,
    paddingHorizontal: 8,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    boxShadow: "0 0 150px rgba(0, 0, 0, 0.4)",
  },
  bookImageContainer: {
    flex: 1,
    overflow: "hidden",
    width: "100%",
    height: "100%",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  bookImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

export default NotebookCard;
