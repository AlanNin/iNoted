import { Linking, StyleSheet } from "react-native";
import React from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "@/components/themed";
import { router } from "expo-router";
import Icon from "@/components/icon";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import * as Application from "expo-application";
import { Image } from "expo-image";

const aboutItems = [
  {
    title: "Version",
    description: `v${Application.nativeApplicationVersion}`,
    disabled: true,
  },
  {
    title: "Consider buying me a coffee",
    icon: "Coffee",
    description: "Tap here to support me",
    href: "https://www.paypal.com/paypalme/alanninm",
    disabled: false,
  },
];

const AboutScreen = () => {
  const theme = useColorScheme();

  const image = theme === "light" ? "app_long" : "dark_app_long";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <View style={styles.headerButton}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="ArrowLeft" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerText}>About</Text>
          </View>
        </View>
        <View
          style={[
            styles.imageContainer,
            { borderColor: colors[theme].foggiest },
          ]}
        >
          <Image source={image} style={styles.image} />
        </View>
        <View style={styles.contentContainer}>
          {aboutItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.itemsButton}
              disabled={item.disabled}
              onPress={() => item.href && Linking.openURL(item.href)}
            >
              {item.icon && <Icon name={item.icon} size={24} />}

              <View style={styles.itemButtonDetails}>
                <Text>{item.title}</Text>
                {item.description && (
                  <Text style={styles.itemButtonDetailsDescription} disabled>
                    {item.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
          <Text style={styles.prettyGirlText} disabled>
            Made with much much love for my girlfriend, Emily ♥️
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AboutScreen;

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
  imageContainer: {
    gap: 12,
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 12,
    paddingHorizontal: 8,
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
    flex: 1,
  },
  itemButtonDetailsDescription: {
    fontSize: 12,
  },
  prettyGirlText: {
    marginTop: "auto",
    marginBottom: 24,
    textAlign: "center",
    alignSelf: "center",
    fontSize: 12,
    maxWidth: 240,
  },
});
