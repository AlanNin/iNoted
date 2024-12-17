import { StyleSheet } from "react-native";
import React from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "@/components/themed";
import { router } from "expo-router";
import Icon from "@/components/icon";

const themeOptions = ["system", "light", "dark"] as const;

export type ThemeProps = typeof themeOptions[number];

const StorageScreen = () => {
  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <View style={styles.headerButton}>
              <TouchableOpacity onPress={() => router.back()}>
                <Icon name="ArrowLeft" size={24} />
              </TouchableOpacity>
              <Text style={styles.headerText}>Storage</Text>
            </View>
          </View>
          <View style={styles.contentContainer}>
            <TouchableOpacity style={styles.itemsButton}>
              <View style={styles.itemButtonDetails}>
                <Text>Create backup</Text>
                <Text style={styles.itemButtonDetailsDescription} disabled>
                  Save your data to ensure it's safe and easily recoverable.
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.itemsButton}>
              <View style={styles.itemButtonDetails}>
                <Text>Restore backup</Text>
                <Text style={styles.itemButtonDetailsDescription} disabled>
                  Recover your saved data from a previous backup to restore your
                  settings and files.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default StorageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100%",
  },
  wrapper: {
    flex: 1,
    paddingVertical: 16,
  },
  header: {
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 8,
    paddingHorizontal: 8,
  },
  itemsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  itemButtonDetails: {
    flexDirection: "column",
    gap: 4,
  },
  itemButtonDetailsDescription: {
    fontSize: 12,
  },
});
