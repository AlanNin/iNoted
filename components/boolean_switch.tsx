import React from "react";

import { Text, TouchableOpacity, View } from "./themed";
import { StyleSheet } from "react-native";
import { Switch } from "react-native-gesture-handler";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";

export default function BooleanSwitch({
  label,
  selectedValue,
  handleSelectValue,
}: {
  label: string;
  selectedValue: boolean;
  handleSelectValue: (value: boolean) => void;
}) {
  const theme = useColorScheme();
  const [isEnabled, setIsEnabled] = React.useState(selectedValue);

  React.useEffect(() => {
    setIsEnabled(selectedValue);
  }, [selectedValue]);

  const toggleSwitch = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    handleSelectValue(newValue);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleSwitch} style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
      <Switch
        trackColor={{
          false: colors[theme].switch.bg_inactive,
          true: colors[theme].switch.bg_active,
        }}
        thumbColor={
          isEnabled
            ? colors[theme].switch.thumb_active
            : colors[theme].switch.thumb_inactive
        }
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
    gap: 32,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  label: {
    flex: 1,
  },
});
