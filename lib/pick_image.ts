import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

export const pickImage = async ({
  allowMultipleSelecion = false,
  selectionLimit = 1,
  onPick,
}: {
  allowMultipleSelecion?: boolean;
  selectionLimit?: number;
  onPick: (uri: string) => void;
}) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [3, 4],
    quality: 1,
    legacy: true,
    allowsMultipleSelection: allowMultipleSelecion,
    selectionLimit: selectionLimit,
  });

  if (!result.canceled) {
    const uri = result.assets[0].uri;

    const backgroundsDir = `${FileSystem.documentDirectory}notebook-backgrounds/`;
    await FileSystem.makeDirectoryAsync(backgroundsDir, {
      intermediates: true,
    });

    const fileName = `notebook_background_${Date.now()}.jpg`;
    const newUri = `${backgroundsDir}${fileName}`;

    await FileSystem.copyAsync({ from: uri, to: newUri });

    onPick(newUri);
  }
};
