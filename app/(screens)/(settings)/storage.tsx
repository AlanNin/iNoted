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
import * as DocumentPicker from "expo-document-picker";
import AppBackupManager from "@/lib/backup";
import { expo_db } from "@/db/client";
import { reloadAppAsync } from "expo";
import { toast } from "@backpackapp-io/react-native-toast";
import BottomDrawerConfirm from "@/components/bottom_drawer_confirm";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

const StorageScreen = () => {
  const bottomConfirmRestoreDrawerRef = React.useRef<BottomSheetModal>(null);
  const backupManager = new AppBackupManager(expo_db);
  const [result, setResult] = React.useState<any>();

  const handleToggleBottomConfirmRestoreDrawer = () => {
    bottomConfirmRestoreDrawerRef.current?.present();
  };

  const handleCreateBackup = async () => {
    try {
      const backupPath = await backupManager.createBackup();

      await backupManager.shareBackup(backupPath);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleRestoreBackupConfirmation = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }
      setResult(result);

      handleToggleBottomConfirmRestoreDrawer();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleRestoreBackup = async () => {
    try {
      const backupFilePath = await backupManager.importBackup(
        result.assets[0].uri
      );
      await backupManager.restoreBackup(backupFilePath);

      reloadAppAsync();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };
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
            <TouchableOpacity
              style={styles.itemsButton}
              onPress={handleCreateBackup}
            >
              <View style={styles.itemButtonDetails}>
                <Text>Create backup</Text>
                <Text style={styles.itemButtonDetailsDescription} disabled>
                  Save your data to ensure it's safe and easily recoverable.
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.itemsButton}
              onPress={handleRestoreBackupConfirmation}
            >
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
      <BottomDrawerConfirm
        ref={bottomConfirmRestoreDrawerRef}
        title="Restore data from backup"
        description={`Are you sure you want to restore your data from this backup? This action will replace all existing data.`}
        submitButtonText="Restore"
        onSubmit={handleRestoreBackup}
      />
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
    gap: 16,
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
