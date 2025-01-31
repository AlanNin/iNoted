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
import BottomDrawerConfirm from "@/components/bottom_drawer_confirm";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as FileSystem from "expo-file-system";
import useColorScheme from "@/hooks/useColorScheme";
import colors from "@/constants/colors";

type StorageInfo = {
  appUsed: number;
  deviceUsed: number;
  deviceFree: number;
  deviceTotal: number;
  loading: boolean;
  error: string | null;
};

const StorageScreen = () => {
  const theme = useColorScheme();
  const bottomConfirmRestoreDrawerRef = React.useRef<BottomSheetModal>(null);
  const backupManager = new AppBackupManager(expo_db);
  const [result, setResult] = React.useState<any>();
  const [storageInfo, setStorageInfo] = React.useState<StorageInfo>({
    appUsed: 0,
    deviceUsed: 0,
    deviceFree: 0,
    deviceTotal: 0,
    loading: true,
    error: null,
  });

  const handleToggleBottomConfirmRestoreDrawer = () => {
    bottomConfirmRestoreDrawerRef.current?.present();
  };

  const handleCreateBackup = async () => {
    await backupManager.createBackup();
  };

  const handleRestoreBackupConfirmation = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }
    setResult(result);

    handleToggleBottomConfirmRestoreDrawer();
  };

  const handleRestoreBackup = async () => {
    const backupFilePath = await backupManager.importBackup(
      result.assets[0].uri
    );
    await backupManager.restoreBackup(backupFilePath);

    reloadAppAsync();
  };

  const storageBackupItems = [
    {
      title: "Create Backup",
      icon: "Backup",
      description: "Save your data to ensure it's safe and easily recoverable.",
      onPress: handleCreateBackup,
    },
    {
      title: "Restore Backup",
      icon: "Restore",
      description:
        "Recover your saved data from a previous backup to restore your settings and files.",
      onPress: handleRestoreBackupConfirmation,
    },
  ];

  const getDirectorySize = async (dirPath: string): Promise<number> => {
    try {
      let totalSize = 0;
      const items = await FileSystem.readDirectoryAsync(dirPath);

      for (const item of items) {
        const itemPath = `${dirPath}${item}`;
        const itemInfo = await FileSystem.getInfoAsync(itemPath, {
          size: true,
        });

        if (itemInfo.exists) {
          if (itemInfo.isDirectory) {
            totalSize += await getDirectorySize(itemPath + "/");
          } else {
            totalSize += itemInfo.size || 0;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
      return 0;
    }
  };

  React.useEffect(() => {
    const getAppStorageSize = async (): Promise<number> => {
      let totalSize = 0;

      try {
        if (FileSystem.documentDirectory) {
          const docDirSize = await getDirectorySize(
            FileSystem.documentDirectory
          );
          totalSize += docDirSize;
        }

        if (FileSystem.cacheDirectory) {
          const cacheDirInfo = await FileSystem.getInfoAsync(
            FileSystem.cacheDirectory,
            { size: true }
          );
          if (cacheDirInfo.exists && cacheDirInfo.size) {
            totalSize += cacheDirInfo.size;
          }
        }
      } catch (error) {
        //
      }

      return totalSize;
    };

    const getStorageInfo = async () => {
      try {
        const totalBytes = await FileSystem.getTotalDiskCapacityAsync();
        const freeBytes = await FileSystem.getFreeDiskStorageAsync();
        const usedBytes = totalBytes - freeBytes;

        const appUsedBytes = await getAppStorageSize();

        setStorageInfo({
          appUsed: appUsedBytes,
          deviceUsed: usedBytes,
          deviceFree: freeBytes,
          deviceTotal: totalBytes,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStorageInfo((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    };

    getStorageInfo();
  }, []);

  const formatStorage = (bytes: number) => {
    const gb = bytes / (1000 * 1000 * 1000);
    const mb = bytes / (1000 * 1000);

    if (gb >= 1) {
      return `${gb.toFixed(0)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
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
            <View style={styles.section}>
              <Text
                style={styles.label}
                customBackgroundColor={colors[theme].foggier}
              >
                Backup
              </Text>
              {storageBackupItems.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  style={styles.itemsButton}
                  onPress={item.onPress}
                >
                  {item.icon && <Icon name={item.icon} size={24} />}

                  <View style={styles.itemButtonDetails}>
                    <Text>{item.title}</Text>
                    {item.description && (
                      <Text
                        style={styles.itemButtonDetailsDescription}
                        disabled
                      >
                        {item.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.section}>
              <Text
                style={styles.label}
                customBackgroundColor={colors[theme].foggier}
              >
                Usage
              </Text>
              {/* Chart */}
              <View style={styles.storageContainer}>
                <View
                  style={styles.progressBar}
                  customBackgroundColor={colors[theme].chart.background}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (storageInfo.appUsed / storageInfo.deviceTotal) * 100
                        }%`,
                        backgroundColor: colors[theme].chart.secondary,
                        zIndex: 2,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (storageInfo.deviceUsed / storageInfo.deviceTotal) *
                          100
                        }%`,
                        backgroundColor: colors[theme].chart.primary,
                        zIndex: 1,
                      },
                    ]}
                  />
                </View>
                <View style={styles.storageLegendContainer}>
                  <View style={styles.storageLegend}>
                    <View
                      style={styles.storageLegendSquare}
                      customBackgroundColor={colors[theme].chart.secondary}
                    />
                    <Text style={styles.storageLegendText}>
                      iNoted Used: {formatStorage(storageInfo.appUsed)}
                    </Text>
                  </View>
                  <View style={styles.storageLegend}>
                    <View
                      style={styles.storageLegendSquare}
                      customBackgroundColor={colors[theme].chart.primary}
                    />
                    <Text style={styles.storageLegendText}>
                      Device Used: {formatStorage(storageInfo.deviceUsed)}
                    </Text>
                  </View>

                  <View style={styles.storageLegend}>
                    <View
                      style={styles.storageLegendSquare}
                      customBackgroundColor={colors[theme].chart.background}
                    />
                    <Text style={styles.storageLegendText}>
                      Device Free: {formatStorage(storageInfo.deviceFree)} /{" "}
                      {formatStorage(storageInfo.deviceTotal)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
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
    gap: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  section: {
    flexDirection: "column",
    gap: 2,
  },
  label: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 16,
    marginBottom: 8,
  },
  itemsButton: {
    padding: 16,
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
  storageContainer: {
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    flexDirection: "column",
    gap: 20,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
  storageLegendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },
  storageLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  storageLegendSquare: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  storageLegendText: {
    fontSize: 12,
  },
});
