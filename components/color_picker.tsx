import React from "react";
import { Modal, StyleSheet } from "react-native";
import ColorPicker, { Panel1, HueSlider } from "reanimated-color-picker";
import { Text, TouchableOpacity, View } from "./themed";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";

export default function ColorPickerComponent({
  showModal,
  setShowModal,
  setBackground,
}: {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  setBackground: (background: string) => void;
}) {
  const [color, setColor] = React.useState("red");

  const theme = useColorScheme();

  const selectColor = () => {
    setBackground(color);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={showModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors[theme].background },
            ]}
          >
            <Text style={styles.title}>Select your color</Text>
            <Text style={styles.subtitle} disabled>
              Give your notebook a personal touch
            </Text>
            <ColorPicker
              style={{ width: "100%", borderRadius: 12 }}
              value="white"
              onComplete={({ hex }: { hex: string }) => setColor(hex)}
              thumbSize={32}
            >
              <Panel1 style={styles.panel} />
              <HueSlider style={{ marginTop: 8 }} thumbSize={24} />
            </ColorPicker>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.button}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <View
                style={styles.buttonsDivider}
                customBackgroundColor={colors[theme].foggy}
              />
              <TouchableOpacity onPress={selectColor} style={styles.button}>
                <Text style={{ color: colors[theme].primary }}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    width: 600,
    maxWidth: "100%",
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    padding: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  panel: {
    width: "100%",
    height: 300,
    borderRadius: 0,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  buttonsDivider: {
    width: 1,
  },
  button: {
    padding: 4,
  },
});
