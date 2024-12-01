import * as React from "react";
import { StyleSheet, useColorScheme, Image } from "react-native";
import { Text, TouchableOpacity, View } from "@/components/themed";
import { ArrowRight, CircleCheckBig } from "lucide-react-native";
import { MotiView } from "moti";
import colors from "@/constants/colors";
import { router } from "expo-router";

const steps = [
  {
    title: "Welcome to iNoted",
    subtitle: "Capture your thoughts, anytime, anywhere.",
    image: require("@/assets/icons/AppWOBG.png"),
  },
  {
    title: "Organize your ideas",
    subtitle: "Create notebooks, tags, and categories.",
    image: require("@/assets/images/placeholder1.png"),
  },
  {
    title: "Safe and secure",
    subtitle: "All your information only accessible through your device.",
    image: require("@/assets/images/placeholder2.png"),
  },
];

export default function StartScreen() {
  const colorScheme = useColorScheme();
  const [currentStep, setCurrentStep] = React.useState(0);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace("./(screens)/home");
    }
  };

  function Dot({ active }: { active: boolean }) {
    return (
      <MotiView
        from={{ width: 4 }}
        animate={{
          width: active ? 24 : 4,
          backgroundColor: active
            ? colorScheme === "light"
              ? colors.light.primary
              : colors.dark.primary
            : colorScheme === "light"
            ? colors.light.foggy
            : colors.dark.foggy,
        }}
        transition={{
          type: "timing",
          duration: 200,
        }}
        style={styles.dot}
      />
    );
  }

  const currentStepData = steps[currentStep] || steps[0];

  return (
    <View style={styles.container}>
      <MotiView
        key={`step-${currentStep}`}
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "timing",
          duration: 300,
        }}
        style={styles.stepsContainer}
      >
        <Image
          source={currentStepData.image}
          style={[
            currentStep === 0 ? styles.logo : styles.imageShowCase,
            currentStep === 0 && {
              tintColor:
                colorScheme === "light" ? colors.light.tint : colors.dark.tint,
            },
            currentStep === 1 && {
              height: 400,
            },
            currentStep === 2 && {
              height: 225,
              marginBottom: 12,
            },
          ]}
          accessibilityLabel={`Step ${currentStep + 1} Image`}
          resizeMode="contain"
        />
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
      </MotiView>

      <View style={styles.dotsContainer}>
        {steps.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setCurrentStep(index)}
            style={styles.dotzone}
          >
            <Dot active={index === currentStep} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleNextStep}
        lightColor={colors.light.primary}
        darkColor={colors.dark.primary}
      >
        <Text style={[styles.buttonText, { color: colors.dark.tint }]}>
          {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
        </Text>
        {currentStep === steps.length - 1 ? (
          <CircleCheckBig
            size={20}
            color={colors.dark.tint}
            style={styles.icon}
          />
        ) : (
          <ArrowRight size={20} color={colors.dark.tint} style={styles.icon} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepsContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
    marginTop: 12,
  },
  imageShowCase: {
    width: "100%",
    height: 350,
    marginBottom: 24,
    objectFit: "contain",
  },
  title: {
    fontFamily: "Geist-SemiBold",
    fontSize: 28,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Geist-Regular",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 42,
    opacity: 0.8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    padding: 16,
    paddingBottom: 18,
    width: "80%",
    marginTop: "auto",
    marginBottom: 36,
  },
  buttonText: {
    fontFamily: "Geist-SemiBold",
    fontSize: 18,
  },
  icon: {
    marginLeft: 12,
    marginTop: 2.5,
    fontSize: 18,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  dotzone: {
    width: "auto",
    height: "auto",
    padding: 8,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 9999,
  },
});
