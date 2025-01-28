import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="storage" options={{ headerShown: false }} />
      <Stack.Screen name="appearance" options={{ headerShown: false }} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
      <Stack.Screen name="faq" options={{ headerShown: false }} />
    </Stack>
  );
}
