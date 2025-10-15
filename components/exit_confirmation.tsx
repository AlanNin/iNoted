import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import { StyleSheet } from "react-native";
import { Text, TouchableOpacity, View } from "./themed";

const ExitConfirmationAlert = ({
  title = "Exit App",
  message = "Are you sure you want to exit?",
  onCancel,
  onConfirm,
}: {
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const theme = useColorScheme();
  return (
    <View customBackgroundColor="transparent" style={styles.container}>
      <TouchableOpacity style={styles.container} onPress={onCancel}>
        <View
          style={[
            styles.alertBox,
            { backgroundColor: colors[theme].background },
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            <Text style={styles.title}>{title}</Text>
            <Text
              style={styles.message}
              customTextColor={colors[theme].text_bit_muted}
            >
              {message}
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.buttonCancel,
                  { borderColor: colors[theme].foggy },
                ]}
                onPress={onCancel}
              >
                <Text customTextColor={colors[theme].text}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors[theme].primary },
                ]}
                onPress={onConfirm}
              >
                <Text customTextColor={colors[theme].primary_text}>Yes</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0,0,0,0.4)",
    position: "absolute",
    inset: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: 288,
    maxWidth: "80%",
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  message: {
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
  },
  buttonCancel: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 1,
  },
  button: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: "center",
  },
});

export default ExitConfirmationAlert;
