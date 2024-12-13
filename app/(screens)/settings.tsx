import { StyleSheet } from "react-native";
import React from "react";
import { SafeAreaView, Text } from "@/components/themed";

const SettingsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>SettingsScreen</Text>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
