import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import * as schemas from "@/db/schema";
import { eq } from "drizzle-orm";
import * as FileSystem from "expo-file-system/legacy";

interface BackupData {
  appConfig: Record<string, any>;
  notebooks: any[];
  notes: any[];
  backgroundImages: {
    fileName: string;
    base64Data: string;
  }[];
}

interface BackupError extends Error {
  code?: string;
  message: string;
}

class AppBackupManager {
  private db: ExpoSQLiteDatabase;
  private backgroundsDir = `${FileSystem.documentDirectory}notebook-backgrounds/`;

  constructor(sqliteDb: SQLite.SQLiteDatabase) {
    this.db = drizzle(sqliteDb);
  }

  private async imageToBase64(filePath: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      const backupError = error as BackupError;
      console.error(
        `Failed to convert image to base64: ${filePath}`,
        backupError
      );
      return "";
    }
  }

  async createBackup(): Promise<void> {
    try {
      // Request permissions
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        throw new Error("Permission to access storage was denied");
      }

      const directoryUri = permissions.directoryUri;

      await FileSystem.makeDirectoryAsync(this.backgroundsDir, {
        intermediates: true,
      });

      // Get all app config
      const keys = await AsyncStorage.getAllKeys();
      const appConfig = await AsyncStorage.multiGet(keys);

      // Fetch all notebooks and notes from the database
      const notebooks = await this.db.select().from(schemas.notebooks);
      const notes = await this.db.select().from(schemas.notes);

      // Collect background image files
      const backgroundFiles = await FileSystem.readDirectoryAsync(
        this.backgroundsDir
      );

      // Convert background images to base64
      const backgroundImages: { fileName: string; base64Data: string }[] = [];
      for (const file of backgroundFiles) {
        const imagePath = `${this.backgroundsDir}${file}`;
        const base64Data = await this.imageToBase64(imagePath);
        backgroundImages.push({
          fileName: file,
          base64Data: base64Data,
        });
      }

      // Prepare backup data
      const backupData: BackupData = {
        appConfig: Object.fromEntries(appConfig),
        notebooks,
        notes,
        backgroundImages,
      };

      // Create backup file
      const filename = `iNoted_backup_${Date.now()}.json`;
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        directoryUri,
        filename,
        "application/json"
      );
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(backupData, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );
    } catch (error) {
      const backupError = error as BackupError;
      throw backupError;
    }
  }

  /**
   * Restore app data from a backup file
   * @param {string} backupFilePath Path to the backup file
   */
  async restoreBackup(
    backupFilePath: string,
    strategy: "overwrite" | "merge" | "skip" = "overwrite"
  ): Promise<{
    notebooksAdded: number;
    notebooksUpdated: number;
    notesAdded: number;
    notesUpdated: number;
  }> {
    try {
      // Read backup file
      const backupContent = await FileSystem.readAsStringAsync(backupFilePath);
      const backupData: BackupData = JSON.parse(backupContent);

      // Restore AsyncStorage configurations (App config)
      const configEntries = Object.entries(backupData.appConfig);
      await AsyncStorage.multiSet(configEntries);

      // Ensure backgrounds directory exists
      await FileSystem.makeDirectoryAsync(this.backgroundsDir, {
        intermediates: true,
      });

      // Restore background images
      for (const image of backupData.backgroundImages) {
        const newPath = `${this.backgroundsDir}${image.fileName}`;

        // Write base64 data back to file
        await FileSystem.writeAsStringAsync(newPath, image.base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      // Tracking variables for restore statistics
      let notebooksAdded = 0;
      let notebooksUpdated = 0;
      let notesAdded = 0;
      let notesUpdated = 0;

      if (strategy === "overwrite") {
        // If overwrite strategy, delete all existing notebooks and notes first
        await this.db.delete(schemas.notebooks);
        await this.db.delete(schemas.notes);
      }

      // Restore notebooks with conflict resolution
      for (const backupNotebook of backupData.notebooks) {
        // Check if notebook with same ID exists
        const existingNotebook = await this.db
          .select()
          .from(schemas.notebooks)
          .where(eq(schemas.notebooks.id, backupNotebook.id))
          .get();

        if (!existingNotebook) {
          // Notebook doesn't exist, insert
          await this.db.insert(schemas.notebooks).values(backupNotebook);
          notebooksAdded++;
        } else {
          // Notebook exists
          switch (strategy) {
            case "overwrite":
              // Replace all notebooks completely
              await this.db.insert(schemas.notebooks).values(backupNotebook);
              notebooksAdded++;
              break;
            case "merge":
              // Merge data, preferring backup data
              await this.db
                .update(schemas.notebooks)
                .set({
                  name: backupNotebook.name,
                  background: backupNotebook.background,
                  // Preserve original created_at, only update other fields
                  updated_at: backupNotebook.updated_at,
                })
                .where(eq(schemas.notebooks.id, backupNotebook.id));
              notebooksUpdated++;
              break;
            case "skip":
              // Do nothing if notebook exists
              break;
          }
        }
      }

      // Restore notes with conflict resolution
      for (const backupNote of backupData.notes) {
        // Check if note with same ID exists
        const existingNote = await this.db
          .select()
          .from(schemas.notes)
          .where(eq(schemas.notes.id, backupNote.id))
          .get();

        if (!existingNote) {
          // Note doesn't exist, insert
          await this.db.insert(schemas.notes).values(backupNote);
          notesAdded++;
        } else {
          // Note exists
          switch (strategy) {
            case "overwrite":
              // Replace all notes completely
              await this.db.insert(schemas.notes).values(backupNote);
              notesAdded++;
              break;
            case "merge":
              // Merge data, preferring backup data
              await this.db
                .update(schemas.notes)
                .set({
                  title: backupNote.title,
                  content: backupNote.content,
                  notebook_id: backupNote.notebook_id,
                  // Preserve original created_at, only update other fields
                  updated_at: backupNote.updated_at,
                })
                .where(eq(schemas.notes.id, backupNote.id));
              notesUpdated++;
              break;
            case "skip":
              // Do nothing if note exists
              break;
          }
        }
      }

      return {
        notebooksAdded,
        notebooksUpdated,
        notesAdded,
        notesUpdated,
      };
    } catch (error) {
      console.error("Backup restoration failed:", error);
      throw error;
    }
  }

  /**
   * Import a backup file from an external source
   * @param {string} uri URI of the backup file to import
   * @returns {Promise<string>} Path of the imported backup file
   */
  async importBackup(uri: string): Promise<string> {
    const backupDir = `${FileSystem.documentDirectory}app-backup/`;
    await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });

    const fileName = uri.split("/").pop();
    const backupFilePath = `${backupDir}${fileName}`;

    await FileSystem.copyAsync({ from: uri, to: backupFilePath });
    return backupFilePath;
  }
}

export default AppBackupManager;
