import { StyleSheet } from "react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "@/components/themed";
import { router } from "expo-router";
import Icon from "@/components/icon";
import Collapsible from "react-native-collapsible";
import { ScrollView } from "react-native-gesture-handler";

const FAQScreen = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  const faqData = [
    {
      question: "Why is my text duplicating when I'm typing a note?",
      answer:
        "If you're using a Samsung device, this issue is caused by the Samsung Keyboard's Text Prediction feature. Here's how to fix it:\n\n1. Disable Text Prediction: Go to your device's keyboard settings and turn off the Text Prediction feature.\n2. Use Another Keyboard: Alternatively, switch to a different keyboard like GBoard (Google Keyboard), which is recommended for better compatibility.\n\nExplanation: Samsung's Text Prediction feature does not properly handle HTML5 tags, which can cause text duplication in certain apps. Unfortunately, this issue cannot be resolved within the app itself and requires changes to your keyboard settings.",
    },
    {
      question: "Can I use the app offline?",
      answer:
        "Yes, iNoted is fully local and offline. You can access your notes and notebooks without an internet connection.",
    },
    {
      question: "How can I change the app theme?",
      answer:
        "You can change the theme by going to Settings > Appearance and select a different theme.",
    },
    {
      question: "How do I remove notes from a notebook?",
      answer:
        "You can enable notes edit mode by long pressing any note or tapping the dots on the top right corner of the notebook screen, then you will see a menu at the bottom of your screen with the options remove or move.",
    },
    {
      question: "Can I sync my notes across multiple devices?",
      answer:
        "No, this feature it not available since iNoted works completely locally and offline. However, I'm planning to add this in the future as an optional feature.",
    },
    {
      question: "How do I recover deleted notes?",
      answer:
        "This feature is not available yet, it will be added in the future.",
    },
    {
      question: "Can I add images to my notes?",
      answer:
        "No, this feature is not available yet, it will be added in the future.",
    },
    {
      question: "How do I search for a specific note or notebook?",
      answer:
        "You can search for a specific note by using the search bar at the top of the Notes or Notebooks screen. Enter title or name related to what you are looking for.",
    },
    {
      question: "Can I use markdown in my notes?",
      answer:
        "Yes, the app supports markdown formatting. You can use markdown syntax to format your notes with headings, lists, bold text, and more.",
    },
    {
      question: "Can I password-protect my notebooks?",
      answer:
        "No, this feature is not available yet, it will be added in the future.",
    },
    {
      question: "How do I share a note with someone?",
      answer:
        "To share a note, open the note and tap the dots icon in the top right corner and then press share. You can then choose to share via email, messaging apps and others.",
    },
    {
      question: "Is there a limit to the number of notes I can create?",
      answer:
        "There is no fixed limit to the number of notes you can create in iNoted. However, the total number of notes is constrained by your device's available storage. To ensure optimal performance, consider managing your notes and removing any unnecessary ones if your device storage is running low.",
    },
    {
      question: "How do I back up my data?",
      answer:
        "You can easily back up your data by exporting it to a file. Here's how:\n\n1. Go to Settings > Data and Storage > Create Backup.\n2. Choose a folder on your device or external storage where you want to save the backup file.\n3. Give iNoted permissions to save this file.\n\nFor added security, store your backup file in a safe location, such as cloud storage (e.g., Google Drive, iCloud) or an external drive. Regularly creating backups ensures that your data is protected in case of device loss or failure.",
    },
    {
      question:
        "Why does iNoted's usage differ from the storage information in settings?",
      answer:
        "The storage usage displayed in the Settings > Data and Storage screen reflects the app's data usage, excluding the app's installation size.",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <View style={styles.headerButton}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="ArrowLeft" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerText}>FAQ</Text>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.contentContainer}>
            {faqData.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleSection(index)}
                >
                  <Text style={styles.questionText}>{item.question}</Text>
                  <Icon
                    name={activeIndex === index ? "ChevronUp" : "ChevronDown"}
                    size={20}
                  />
                </TouchableOpacity>
                <Collapsible collapsed={activeIndex !== index}>
                  <Text style={styles.answerText} disabled>
                    {item.answer}
                  </Text>
                </Collapsible>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default FAQScreen;

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
    paddingHorizontal: 20,
  },
  faqItem: {
    paddingVertical: 12,
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    opacity: 0.85,
  },
  answerText: {
    marginTop: 8,
    fontSize: 14,
  },
});
